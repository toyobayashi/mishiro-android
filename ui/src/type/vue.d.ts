import Vue from 'vue'
import { AdditionalBtn } from '../component/v-modal-alert'

declare module 'vue/types/vue' {
  interface Vue {
    bus: Vue

    setLoading (data: string | number | boolean | Function | { show?: boolean; text?: string; loaded?: number; btnCall?: null | (() => void); }): void
    showLoading (text?: string, btnCall?: null | (() => void)): void
    hideLoading (): void
    alert (body: string, title?: string, additionalBtn?: AdditionalBtn): void
    confirm (body: string, title?: string): Promise<boolean>
    toast (message: string, duration?: 'short' | 'long'): Promise<void>
  }
}
