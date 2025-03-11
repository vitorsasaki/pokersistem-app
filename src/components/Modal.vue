<template>
  <div class="modal" tabindex="-1" role="dialog" :class="{ 'show d-block': show }">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="header"></slot>
          <button type="button" class="close" @click="fechar">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
    <div class="modal-backdrop show" v-if="show"></div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    fechar() {
      this.$emit('close')
    }
  },
  watch: {
    show(valor) {
      if (valor) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
  },
  beforeDestroy() {
    document.body.style.overflow = 'auto'
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.modal-dialog {
  margin-top: 60px;
  max-width: 800px;
}

.modal-content {
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-bottom: 1px solid #eee;
  padding: 15px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 15px;
}

.close {
  float: right;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: .5;
  background: transparent;
  border: 0;
  padding: 1rem;
  margin: -1rem -1rem -1rem auto;
}

.close:hover {
  color: #000;
  opacity: .75;
  cursor: pointer;
}
</style> 