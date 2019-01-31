import VueRouter from 'vue-router'
import Index from '../page/Index.vue'
import Score from '../page/Score.vue'

export default function createRouter () {
  const router = new VueRouter({
    routes: [
      {
        path: '/',
        component: Index,
        name: 'index',
        meta: {
          keepAlive: true
        }
      },
      {
        path: '/score',
        component: Score,
        name: 'score',
        meta: {
          keepAlive: false
        }
      }
    ]
  })
  return router
}
