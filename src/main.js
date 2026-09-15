import { createApp } from 'vue'
import './style.css'
import { Quasar, Notify } from 'quasar'
import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const myApp = createApp(App)

myApp.use(Quasar, {
    plugins: {
        Notify
    }, 
})

myApp.mount('#app')
 