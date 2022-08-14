export default [
{ path: '/birds/bird', name: 'birds.bird', component: () => import('/src/docs/birds/bird/index.vue')},
{ path: '/mammal/canine/dog', name: 'mammal.canine.dog', component: () => import('/src/docs/mammal/canine/dog/index.vue')},
{ path: '/mammal/canine/fox', name: 'mammal.canine.fox', component: () => import('/src/docs/mammal/canine/fox/index.vue')},
{ path: '/mammal/canine/wolf', name: 'mammal.canine.wolf', component: () => import('/src/docs/mammal/canine/wolf/index.vue')},
{ path: '/mammal/cats/cat', name: 'mammal.cats.cat', component: () => import('/src/docs/mammal/cats/cat/index.vue')},
{ path: '/mammal/cats/lion', name: 'mammal.cats.lion', component: () => import('/src/docs/mammal/cats/lion/index.vue')}
]