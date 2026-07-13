import { Injectable, NotFoundException } from '@nestjs/common';
import { Atividade, Opcao, MultiplaEscolha, AssociacaoImagens, ItemAssociacao, AssociacaoCorreta, RespostaMultiplaEscolha } from '../../domain/entities/atividade.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { IAtividadeRepository } from '../../domain/ports/atividade-repository.port';

@Injectable()
export class AtividadeRepository implements IAtividadeRepository {
  constructor(private prisma: PrismaService) { }

  private mapToEntity(record: any, progresso?: { status: string; data_conclusao: Date | null } | null): Atividade {
    let entity: Atividade;

    if (record.tipo_atividade === 'multipla_escolha') {
      const dbOpcoes = record.multipla_escolha?.opcoes ?? [];
      const opcoes = dbOpcoes.map((o: any) => new Opcao(
        o.opcao_id,
        o.texto_opcao,
        o.letra,
        o.correta,
        o.multipla_escolha_id
      ));

      entity = new MultiplaEscolha(
        record.atividade_id,
        record.titulo_atividade,
        record.licao_id,
        record.enunciado,
        opcoes,
        record.explicacao,
      );
    } else if (record.tipo_atividade === 'associacao_imagens') {
      const dbItens = record.associacao_imagens?.itens ?? [];
      const itens = dbItens.map((i: any) => new ItemAssociacao(
        i.item_associacao_id,
        i.tipo,
        i.texto,
        i.imagem_url,
        i.lado,
        i.associacao_id
      ));

      const associacoesCorretas: AssociacaoCorreta[] = [];
      dbItens.forEach((i: any) => {
        if (i.associacoes_corretas_1 && i.associacoes_corretas_1.length > 0) {
          i.associacoes_corretas_1.forEach((ac: any) => {
            associacoesCorretas.push(new AssociacaoCorreta(ac.item_1_id, ac.item_2_id));
          });
        }
      });

      entity = new AssociacaoImagens(
        record.atividade_id,
        record.titulo_atividade,
        record.licao_id,
        record.enunciado,
        itens,
        associacoesCorretas,
      );
    } else {
      throw new Error(`Tipo de atividade desconhecido: ${record.tipo_atividade}`);
    }

    entity.data_criacao = record.data_criacao ?? undefined;
    if (record.licao?.modulo) {
      entity.modulo = {
        modulo_id: record.licao.modulo.modulo_id,
        titulo_modulo: record.licao.modulo.titulo_modulo,
      };
    }
    if (progresso) {
      entity.status = progresso.status as 'a_fazer' | 'fazendo' | 'feito';
      entity.data_conclusao = progresso.data_conclusao;
    } else {
      entity.status = 'a_fazer';
      entity.data_conclusao = null;
    }

    return entity;
  }

  async create(atividade: Atividade): Promise<Atividade> {
    if (atividade instanceof MultiplaEscolha) {
      const data: any = {
        titulo_atividade: atividade.titulo_atividade,
        tipo_atividade: atividade.tipo_atividade,
        enunciado: atividade.enunciado,
        explicacao: atividade.explicacao,
        licao_id: atividade.licao_id,
        multipla_escolha: {
          create: {
            opcoes: {
              create: (atividade.opcoes ?? []).map((o) => ({
                texto_opcao: o.texto_opcao,
                letra: o.letra,
                correta: o.correta,
              })),
            },
          },
        },
      };

      const created = await this.prisma.atividade.create({
        data,
        include: {
          multipla_escolha: {
            include: {
              opcoes: true,
            },
          },
          associacao_imagens: {
            include: {
              itens: {
                include: {
                  associacoes_corretas_1: true,
                },
              },
            },
          },
        },
      });
      return this.mapToEntity(created);
    }

    if (atividade instanceof AssociacaoImagens) {
      const createdAtividade = await this.prisma.atividade.create({
        data: {
          titulo_atividade: atividade.titulo_atividade,
          tipo_atividade: atividade.tipo_atividade,
          enunciado: atividade.enunciado,
          licao_id: atividade.licao_id,
        }
      });

      const createdAssociacao = await this.prisma.associacaoImagens.create({
        data: {
          atividade_id: createdAtividade.atividade_id,
        }
      });

      if (atividade.pares && atividade.pares.length > 0) {
        for (const par of atividade.pares) {
          const leftItem = await this.prisma.itemAssociacao.create({
            data: {
              tipo: par.esquerdo.tipo,
              texto: par.esquerdo.texto,
              imagem_url: par.esquerdo.imagem_url,
              lado: 'esquerdo',
              associacao_id: createdAssociacao.associacao_id,
            }
          });

          const rightItem = await this.prisma.itemAssociacao.create({
            data: {
              tipo: par.direito.tipo,
              texto: par.direito.texto,
              imagem_url: par.direito.imagem_url,
              lado: 'direito',
              associacao_id: createdAssociacao.associacao_id,
            }
          });

          await this.prisma.associacaoCorreta.create({
            data: {
              item_1_id: leftItem.item_associacao_id,
              item_2_id: rightItem.item_associacao_id,
            }
          });
        }
      }

      const fullyCreated = await this.prisma.atividade.findUnique({
        where: { atividade_id: createdAtividade.atividade_id },
        include: {
          multipla_escolha: {
            include: {
              opcoes: true,
            },
          },
          associacao_imagens: {
            include: {
              itens: {
                include: {
                  associacoes_corretas_1: true,
                },
              },
            },
          },
        },
      });
      return this.mapToEntity(fullyCreated);
    }

    throw new Error('Unsupported activity type');
  }

  async findAll(userId?: number): Promise<Atividade[]> {
    let whereCondicao = {};
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const isAdm = user.permissions.includes('ADM');
        const isAluno =
          user.permissions.includes('ALUNO_IDOSO') && !isAdm;
        const isProfessor =
          user.permissions.includes('PROFESSOR') && !isAdm;

        if (isAluno) {
          whereCondicao = {
            licao: {
              modulo: {
                turma_id: user.turma_id ?? -1,
              },
            },
          };
        } else if (isProfessor) {
          whereCondicao = {
            licao: {
              modulo: {
                turma: { professor_id: userId },
              },
            },
          };
        }
      }
    }

    const records = await this.prisma.atividade.findMany({
      where: whereCondicao,
      include: {
        licao: {
          include: {
            modulo: {
              select: {
                modulo_id: true,
                titulo_modulo: true,
              },
            },
          },
        },
        multipla_escolha: {
          include: {
            opcoes: true,
          },
        },
        associacao_imagens: {
          include: {
            itens: {
              include: {
                associacoes_corretas_1: true,
              },
            },
          },
        },
      },
    });

    let progressoMap = new Map<number, { status: string; data_conclusao: Date | null }>();
    if (userId && records.length > 0) {
      const progressos = await this.prisma.progressoAtividade.findMany({
        where: {
          aluno_id: userId,
          atividade_id: { in: records.map((r) => r.atividade_id) },
        },
      });
      progressoMap = new Map(
        progressos.map((p) => [
          p.atividade_id,
          { status: p.status, data_conclusao: p.data_conclusao },
        ]),
      );
    }

    return records.map((record) =>
      this.mapToEntity(record, progressoMap.get(record.atividade_id) ?? null),
    );
  }

  async findById(id: number): Promise<Atividade | null> {
    const record = await this.prisma.atividade.findUnique({
      where: { atividade_id: id },
      include: {
        multipla_escolha: {
          include: {
            opcoes: true,
          },
        },
        associacao_imagens: {
          include: {
            itens: {
              include: {
                associacoes_corretas_1: true,
              },
            },
          },
        },
      },
    });
    if (!record) {
      return null;
    }
    return this.mapToEntity(record);
  }

  async update(id: number, atividade: Partial<Atividade>): Promise<Atividade> {
    const dataUpdate: any = {
      titulo_atividade: atividade.titulo_atividade,
      tipo_atividade: atividade.tipo_atividade,
      enunciado: atividade.enunciado,
      licao_id: atividade.licao_id,
    };

    if (atividade instanceof MultiplaEscolha || ('opcoes' in atividade)) {
      const atvME = atividade as any;
      if (atvME.opcoes) {
        dataUpdate.multipla_escolha = {
          upsert: {
            create: {
              opcoes: {
                create: atvME.opcoes.map((o: any) => ({
                  texto_opcao: o.texto_opcao,
                  letra: o.letra,
                  correta: o.correta,
                })),
              },
            },
            update: {
              opcoes: {
                deleteMany: {},
                create: atvME.opcoes.map((o: any) => ({
                  texto_opcao: o.texto_opcao,
                  letra: o.letra,
                  correta: o.correta,
                })),
              },
            },
          },
        };
      }
    }

    if (atividade instanceof AssociacaoImagens || ('pares' in atividade)) {
      const atvAI = atividade as any;
      if (atvAI.pares) {
        const assoc = await this.prisma.associacaoImagens.findUnique({
          where: { atividade_id: id }
        });
        if (assoc) {
          await this.prisma.itemAssociacao.deleteMany({
            where: { associacao_id: assoc.associacao_id }
          });

          for (const par of atvAI.pares) {
            const leftItem = await this.prisma.itemAssociacao.create({
              data: {
                tipo: par.esquerdo.tipo,
                texto: par.esquerdo.texto,
                imagem_url: par.esquerdo.imagem_url,
                lado: 'esquerdo',
                associacao_id: assoc.associacao_id,
              }
            });

            const rightItem = await this.prisma.itemAssociacao.create({
              data: {
                tipo: par.direito.tipo,
                texto: par.direito.texto,
                imagem_url: par.direito.imagem_url,
                lado: 'direito',
                associacao_id: assoc.associacao_id,
              }
            });

            await this.prisma.associacaoCorreta.create({
              data: {
                item_1_id: leftItem.item_associacao_id,
                item_2_id: rightItem.item_associacao_id,
              }
            });
          }
        }
      }
    }

    const updated = await this.prisma.atividade.update({
      where: { atividade_id: id },
      data: dataUpdate,
      include: {
        multipla_escolha: {
          include: {
            opcoes: true,
          },
        },
        associacao_imagens: {
          include: {
            itens: {
              include: {
                associacoes_corretas_1: true,
              },
            },
          },
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.atividade.delete({
      where: { atividade_id: id },
    });
  }

  async saveRespostaMultiplaEscolha(alunoId: number, opcaoId: number): Promise<RespostaMultiplaEscolha> {
    const record = await this.prisma.respostaMultiplaEscolha.create({
      data: {
        aluno_id: alunoId,
        resposta_aluno_id: opcaoId,
      },
    });
    return new RespostaMultiplaEscolha(
      record.resposta_me_id,
      record.aluno_id,
      record.resposta_aluno_id,
      record.data_resposta,
    );
  }

  async saveRespostaAssociacao(alunoId: number, atividadeId: number, respostas: { item_1_id: number, item_2_id: number }[]): Promise<any> {
    const associacao = await this.prisma.associacaoImagens.findUnique({
      where: { atividade_id: atividadeId },
    });
    if (!associacao) throw new NotFoundException('Associação de imagens não encontrada');

    return await this.prisma.tentativaAssociacao.create({
      data: {
        user_id: alunoId,
        associacao_id: associacao.associacao_id,
        respostas: {
          create: respostas.map(r => ({
            item_1_id: r.item_1_id,
            item_2_id: r.item_2_id,
          }))
        }
      },
      include: {
        respostas: true
      }
    });
  }

  async iniciarProgresso(alunoId: number, atividadeId: number) {
    const existente = await this.prisma.progressoAtividade.findUnique({
      where: {
        aluno_id_atividade_id: { aluno_id: alunoId, atividade_id: atividadeId },
      },
    });

    if (existente?.status === 'feito') {
      return {
        status: 'feito' as const,
        data_inicio: existente.data_inicio,
        data_conclusao: existente.data_conclusao,
      };
    }

    const agora = new Date();
    const progresso = await this.prisma.progressoAtividade.upsert({
      where: {
        aluno_id_atividade_id: { aluno_id: alunoId, atividade_id: atividadeId },
      },
      create: {
        aluno_id: alunoId,
        atividade_id: atividadeId,
        status: 'fazendo',
        data_inicio: agora,
      },
      update: {
        status: 'fazendo',
        data_inicio: existente?.data_inicio ?? agora,
      },
    });

    return {
      status: progresso.status as 'fazendo',
      data_inicio: progresso.data_inicio,
      data_conclusao: progresso.data_conclusao,
    };
  }

  async marcarFeito(alunoId: number, atividadeId: number) {
    const agora = new Date();
    const existente = await this.prisma.progressoAtividade.findUnique({
      where: {
        aluno_id_atividade_id: { aluno_id: alunoId, atividade_id: atividadeId },
      },
    });

    const progresso = await this.prisma.progressoAtividade.upsert({
      where: {
        aluno_id_atividade_id: { aluno_id: alunoId, atividade_id: atividadeId },
      },
      create: {
        aluno_id: alunoId,
        atividade_id: atividadeId,
        status: 'feito',
        data_inicio: agora,
        data_conclusao: agora,
      },
      update: {
        status: 'feito',
        data_inicio: existente?.data_inicio ?? agora,
        data_conclusao: agora,
      },
    });

    return {
      status: 'feito' as const,
      data_inicio: progresso.data_inicio,
      data_conclusao: progresso.data_conclusao,
    };
  }
}
