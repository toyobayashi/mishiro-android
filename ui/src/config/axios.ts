import axios from 'axios'

// axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? 'http://127.0.0.1:80' : ''
axios.defaults.headers['x-mishiro-version'] = '1.0.0'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export default axios
