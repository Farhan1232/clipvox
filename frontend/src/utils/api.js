import axios from 'axios'

const raw = import.meta.env.VITE_API_URL ?? ''
const baseURL = raw && !raw.startsWith('http') ? `https://${raw}` : raw

export default axios.create({ baseURL })
