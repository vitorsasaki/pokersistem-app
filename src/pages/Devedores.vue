<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title">Devedores</h4>
              <div>
                <button 
                  class="btn btn-success btn-sm mr-2" 
                  @click="enviarMensagensEmLote"
                  :disabled="!devedoresSelecionados.length"
                >
                  <i class="fab fa-whatsapp"></i> Enviar em Lote
                </button>
                <button class="btn btn-success btn-sm mr-2" @click="exportarDevedores">
                  <i class="ti-download"></i> Exportar
                </button>
                <button class="btn btn-primary btn-sm" @click="abrirModalNovoLancamento">
                  <i class="ti-plus"></i> Novo Lançamento
                </button>
              </div>
            </div>
          </template>
          
          <div v-if="carregando" class="text-center my-5">
            <i class="fa fa-spinner fa-spin fa-3x"></i>
            <p class="mt-2">Carregando devedores...</p>
          </div>

          <div v-else-if="erro" class="alert alert-danger" role="alert">
            {{ erro }}
          </div>

          <div v-else>
            <!-- Seção de Filtros -->
            <div class="card-body pb-0">
              <div class="row align-items-center">
                <div class="col-md-3">
                  <div class="form-group">
                    <label>Filtrar por</label>
                    <div class="d-flex align-items-center">
                      <select class="form-control" v-model="filtro.campo">
                        <option value="">Selecione um campo</option>
                        <option value="id">ID</option>
                        <option value="jogador">Jogador</option>
                        <option value="nomeReal">Nome Real</option>
                        <option value="valor">Valor</option>                    
                        <option value="dataUltimaAtualizacao">Última Atualização</option>
                      </select>
                      <div class="ml-2">
                        <div class="custom-control custom-checkbox">
                          <input 
                            type="checkbox" 
                            class="custom-control-input" 
                            id="mostrarApenasDevedores" 
                            v-model="mostrarApenasDevedores"
                          >
                          <label class="custom-control-label" for="mostrarApenasDevedores">
                            Apenas devedores
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-7">
                  <div class="form-group">
                    <label>{{ filtro.campo === 'dataUltimaAtualizacao' ? 'Período' : 'Valor do filtro' }}</label>
                    <div v-if="filtro.campo === 'dataUltimaAtualizacao'" class="row">
                      <div class="col-md-6">
                        <input
                          type="date"
                          class="form-control"
                          :value="getDataSemHora(filtro.dataInicial)"
                          @input="setDataInicial($event.target.value)"
                          placeholder="Data Inicial"
                        />
                      </div>
                      <div class="col-md-6">
                        <input
                          type="date"
                          class="form-control"
                          :value="getDataSemHora(filtro.dataFinal)"
                          @input="setDataFinal($event.target.value)"
                          placeholder="Data Final"
                        />
                      </div>
                    </div>
                    <input
                      v-else
                      type="text"
                      class="form-control"
                      v-model="filtro.valor"
                      :placeholder="obterPlaceholderFiltro"
                    />
                  </div>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-secondary btn-sm w-100" @click="limparFiltro">
                    Limpar Filtro
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>
                      <div class="custom-control custom-checkbox">
                        <input 
                          type="checkbox" 
                          class="custom-control-input" 
                          id="selecionarTodos"
                          v-model="todosDevedoresSelecionados"
                          @change="selecionarTodosDevedores"
                        >
                        <label class="custom-control-label" for="selecionarTodos"></label>
                      </div>
                    </th>
                    <th>ID</th>
                    <th>Jogador</th>
                    <th>Nome Real</th>
                    <th>Valor</th>                
                    <th>Última Atualização</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="devedor in devedoresList" :key="devedor.id">
                    <td>
                      <div class="custom-control custom-checkbox">
                        <input 
                          type="checkbox" 
                          class="custom-control-input" 
                          :id="'devedor' + devedor.id"
                          v-model="devedor.selecionado"
                          :disabled="!devedor.jogador?.celular"
                        >
                        <label class="custom-control-label" :for="'devedor' + devedor.id"></label>
                      </div>
                    </td>
                    <td>{{ devedor.id }}</td>
                    <td>{{ devedor.jogador?.nome || '-' }}</td>
                    <td>{{ devedor.jogador?.nomeReal || '-' }}</td>
                    <td>{{ formatarMoeda(devedor.valor) }}</td>                  
                    <td>{{ formatarDataHora(devedor.dataUltimaAtualizacao) }}</td>
                    <td>
                      <button 
                        v-if="devedor.jogador?.celular"
                        class="btn btn-success btn-sm mr-2" 
                        @click="enviarMensagemWhatsApp(devedor)"
                        title="Enviar WhatsApp"
                      >
                        <i class="fab fa-whatsapp"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!devedoresList.length">
                    <td colspan="5" class="text-center">Nenhum devedor encontrado</td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginação -->
              <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
                  Mostrando {{ inicioContagem }} 
                  a {{ fimContagem }} 
                  de {{ totalItens }} devedores
                </div>
                <nav aria-label="Navegação de páginas">
                  <ul class="pagination mb-0">
                    <li :class="['page-item', { disabled: paginaAtual === 1 }]">
                      <a class="page-link" href="#" @click.prevent="mudarPagina(paginaAtual - 1)">
                        <i class="ti-angle-left"></i>
                      </a>
                    </li>
                    <li 
                      v-for="pagina in paginas" 
                      :key="pagina"
                      :class="['page-item', { active: pagina === paginaAtual }]"
                    >
                      <a class="page-link" href="#" @click.prevent="mudarPagina(pagina)">
                        {{ pagina }}
                      </a>
                    </li>
                    <li :class="['page-item', { disabled: paginaAtual === totalPaginas }]">
                      <a class="page-link" href="#" @click.prevent="mudarPagina(paginaAtual + 1)">
                        <i class="ti-angle-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>

    <!-- Modal de Lançamento -->
    <lancamento-modal
      :show="showModal"
      :lancamento-edit="lancamentoSelecionado"
      @fechar="fecharModal"
      @salvar="salvarLancamento"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import axios from '@/config/axios'
import LancamentoModal from '@/components/Modals/LancamentoModal.vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  components: {
    Card,
    LancamentoModal
  },
  data() {
    return {
      todosDevedores: [],
      devedores: [],
      carregando: true,
      erro: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      filtro: {
        campo: 'nomeReal',
        valor: '',
        dataInicial: '',
        dataFinal: ''
      },
      showModal: false,
      lancamentoSelecionado: null,
      mostrarApenasDevedores: false,
      todosDevedoresSelecionados: false
    }
  },
  computed: {
    devedoresList() {
      return this.devedores || []
    },
    totalPaginas() {
      return Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina))
    },
    inicioContagem() {
      return this.totalItens === 0 ? 0 : (this.paginaAtual * this.itensPorPagina - this.itensPorPagina + 1)
    },
    fimContagem() {
      return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens)
    },
    paginas() {
      const paginas = []
      if (this.totalPaginas <= 1) return paginas

      let inicio = Math.max(1, this.paginaAtual - 2)
      let fim = Math.min(this.totalPaginas, this.paginaAtual + 2)

      if (fim - inicio < 4) {
        if (inicio === 1) {
          fim = Math.min(5, this.totalPaginas)
        } else {
          inicio = Math.max(1, fim - 4)
        }
      }

      for (let i = inicio; i <= fim; i++) {
        paginas.push(i)
      }
      return paginas
    },
    devedoresFiltrados() {
      let resultado = this.todosDevedores

      // Primeiro aplica o filtro de devedores se estiver ativado
      if (this.mostrarApenasDevedores) {
        resultado = resultado.filter(devedor => devedor.valor > 0)
      }

      if (!this.filtro.campo) {
        return resultado
      }

      if (this.filtro.campo === 'dataUltimaAtualizacao') {
        if (!this.filtro.dataInicial && !this.filtro.dataFinal) {
          return resultado
        }

        return resultado.filter(devedor => {
          const dataAtualizacao = new Date(devedor.dataUltimaAtualizacao)
          const dataInicial = this.filtro.dataInicial ? new Date(this.filtro.dataInicial) : null
          const dataFinal = this.filtro.dataFinal ? new Date(this.filtro.dataFinal) : null

          if (dataInicial && dataFinal) {
            return dataAtualizacao >= dataInicial && dataAtualizacao <= dataFinal
          } else if (dataInicial) {
            return dataAtualizacao >= dataInicial
          } else if (dataFinal) {
            return dataAtualizacao <= dataFinal
          }
          return true
        })
      }

      if (!this.filtro.valor) {
        return resultado
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return resultado.filter(devedor => {
        if (this.filtro.campo === 'id') {
          return devedor.id.toString() === valorFiltro
        }
        
        if (this.filtro.campo === 'jogador') {
          return devedor.jogador?.nome?.toLowerCase().includes(valorFiltro)
        }

        if (this.filtro.campo === 'nomeReal') {
          return devedor.jogador?.nomeReal?.toLowerCase().includes(valorFiltro)
        }
        
        if (this.filtro.campo === 'valor') {
          return devedor.valor.toString().includes(valorFiltro)
        }
        
        const valorCampo = devedor[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        id: 'Digite o ID',
        jogador: 'Digite o nome do jogador',
        nomeReal: 'Digite o nome real do jogador',
        valor: 'Digite o valor',
        dataUltimaAtualizacao: 'Digite a data (dd/mm/aaaa hh:mm:ss)'
      }
      return this.filtro.campo ? placeholders[this.filtro.campo] : 'Selecione um campo para filtrar'
    },
    devedoresSelecionados() {
      return this.devedoresList.filter(d => d.selecionado && d.jogador?.celular)
    }
  },
  watch: {
    'filtro.campo'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtro.valor'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    devedoresFiltrados() {
      this.totalItens = this.devedoresFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarDevedores() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/devedores')
        
        if (response.data) {
          this.todosDevedores = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosDevedores.length
          this.aplicarPaginacao()
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar devedores:', error)
        this.erro = `Erro ao carregar a lista de devedores: ${error.message}`
        this.todosDevedores = []
        this.devedores = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.devedores = this.devedoresFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    limparFiltro() {
      this.filtro.campo = ''
      this.filtro.valor = ''
      this.filtro.dataInicial = ''
      this.filtro.dataFinal = ''
      this.mostrarApenasDevedores = false
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    formatarMoeda(valor) {
      if (valor === null || valor === undefined) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor)
    },
    formatarDataHora(data) {
      if (!data) return '-'
      const dataObj = new Date(data)
      return `${dataObj.toLocaleDateString('pt-BR')} ${dataObj.toLocaleTimeString('pt-BR')}`
    },
    abrirModalNovoLancamento() {
      this.lancamentoSelecionado = null
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.lancamentoSelecionado = null
    },
    async salvarLancamento(lancamento) {
      try {
        console.log('Dados a serem enviados:', lancamento)
        
        const response = await axios.post('/lancamentoDevedor', lancamento)
        console.log('Resposta da API (POST):', response.data)
        this.$notify({
          message: 'Lançamento criado com sucesso!',
          type: 'success'
        })
        
        await this.carregarDevedores()
      } catch (error) {
        console.error('Erro ao salvar lançamento:', error)
        console.error('Detalhes do erro:', error.response?.data)
        
        let mensagemErro = 'Erro ao salvar lançamento.'
        
        if (error.response?.data?.message) {
          mensagemErro += ` ${error.response.data.message}`
        } else if (error.response?.data?.error) {
          mensagemErro += ` ${error.response.data.error}`
        }
        
        this.$notify({
          message: mensagemErro,
          type: 'danger'
        })
      }
    },
    getDataSemHora(data) {
      if (!data) return ''
      return data.split('T')[0]
    },
    setDataInicial(data) {
      if (!data) {
        this.filtro.dataInicial = ''
        return
      }
      const dataComHora = new Date(data)
      dataComHora.setHours(0, 1, 0)
      this.filtro.dataInicial = dataComHora.toISOString().slice(0, 16)
      this.aplicarPaginacao()
    },
    setDataFinal(data) {
      if (!data) {
        this.filtro.dataFinal = ''
        return
      }
      const dataComHora = new Date(data)
      dataComHora.setHours(23, 59, 0)
      this.filtro.dataFinal = dataComHora.toISOString().slice(0, 16)
      this.aplicarPaginacao()
    },
    async exportarDevedores() {
      try {
        // Filtra apenas os devedores (valor > 0)
        const devedoresParaExportar = this.todosDevedores
          .filter(devedor => devedor.valor > 0)
          .map(devedor => [
            devedor.id,
            devedor.jogador?.nome || '-',
            devedor.jogador?.nomeReal || '-',
            this.formatarMoeda(devedor.valor),
            this.formatarDataHora(devedor.dataUltimaAtualizacao)
          ]);

        // Cria o documento PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        
        // Adiciona o título
        doc.setFontSize(16);
        doc.text('Lista de Devedores', 40, 40);
        doc.setFontSize(10);
        doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 40, 60);

        // Adiciona a tabela
        doc.autoTable({
          head: [['ID', 'Jogador', 'Nome Real', 'Valor', 'Última Atualização']],
          body: devedoresParaExportar,
          startY: 80,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 5,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [107, 208, 152], // Cor verde do botão
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 },  // ID
            1: { cellWidth: 100 }, // Jogador
            2: { cellWidth: 100 }, // Nome Real
            3: { cellWidth: 80 },  // Valor
            4: { cellWidth: 120 }  // Última Atualização
          }
        });

        // Adiciona o rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 20,
            { align: 'center' }
          );
        }

        // Faz o download do PDF
        doc.save(`devedores_${new Date().toISOString().split('T')[0]}.pdf`);

        this.$notify({
          message: 'Lista de devedores exportada com sucesso!',
          type: 'success'
        });
      } catch (error) {
        console.error('Erro ao exportar devedores:', error);
        this.$notify({
          message: 'Erro ao exportar lista de devedores. Por favor, tente novamente.',
          type: 'danger'
        });
      }
    },
    enviarMensagemWhatsApp(devedor) {
      // Remove caracteres não numéricos do celular
      const celular = devedor.jogador.celular.replace(/\D/g, '');
      
      // Monta a mensagem
      const mensagem = encodeURIComponent(
        `E ai ${devedor.jogador.nomeReal} blz?, \n` +
        `Consegue me mandar o valor em aberto de ${this.formatarMoeda(devedor.valor)}. \n` +
        `Por favor, se puder enviar no pix 96261668191`
      );

      // Cria o link do WhatsApp
      const url = `https://wa.me/55${celular}?text=${mensagem}`;

      // Abre em uma nova aba
      window.open(url, '_blank');
    },
    selecionarTodosDevedores() {
      this.devedoresList.forEach(devedor => {
        if (devedor.jogador?.celular) {
          devedor.selecionado = this.todosDevedoresSelecionados
        }
      })
    },
    async enviarMensagensEmLote() {
      const devedores = this.devedoresSelecionados
      
      if (devedores.length === 0) {
        this.$notify({
          message: 'Selecione pelo menos um devedor com celular cadastrado.',
          type: 'warning'
        })
        return
      }

      // Abre as mensagens em sequência com um pequeno delay
      for (let i = 0; i < devedores.length; i++) {
        const devedor = devedores[i]
        setTimeout(() => {
          this.enviarMensagemWhatsApp(devedor)
        }, i * 1000) // Delay de 1 segundo entre cada mensagem
      }

      this.$notify({
        message: `Iniciando envio de ${devedores.length} mensagens...`,
        type: 'success'
      })
    }
  },
  mounted() {
    this.carregarDevedores()
  }
}
</script>

<style>
.badge {
  padding: 0.4em 0.8em;
  font-size: 85%;
}
.badge-success {
  background-color: #51cbce;
}
.badge-danger {
  background-color: #ef8157;
}
.badge-warning {
  background-color: #fbc658;
}
.badge-info {
  background-color: #51bcda;
}

.page-link {
  padding: 0.5rem 0.75rem;
  color: #51cbce;
  background-color: #fff;
  border: 1px solid #dee2e6;
}
.page-link:hover {
  color: #34b5b8;
  background-color: #e9ecef;
  border-color: #dee2e6;
}
.page-item.active .page-link {
  background-color: #51cbce;
  border-color: #51cbce;
}
.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.btn-success {
  background-color: #25d366; /* Cor do WhatsApp */
  border-color: #25d366;
}

.btn-success:hover {
  background-color: #128c7e;
  border-color: #128c7e;
}

.fa-whatsapp {
  font-size: 1.1em;
}

.mr-2 {
  margin-right: 0.5rem;
}

.custom-control-input:disabled ~ .custom-control-label::before {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.btn-success:disabled {
  background-color: #93e6b3;
  border-color: #93e6b3;
}
</style> 