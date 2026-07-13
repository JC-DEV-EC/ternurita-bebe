const state = {
  sesion: null,
  carrito: [],
  carritoCount: 0,
  usuario: null,
}

const listeners = new Map()

function notify(prop, value) {
  if (listeners.has(prop)) {
    listeners.get(prop).forEach(fn => fn(value))
  }
}

const store = new Proxy(state, {
  set(target, prop, value) {
    target[prop] = value
    notify(prop, value)
    return true
  },
  get(target, prop) {
    return target[prop]
  },
})

export function onStoreChange(prop, callback) {
  if (!listeners.has(prop)) {
    listeners.set(prop, new Set())
  }
  listeners.get(prop).add(callback)
  return () => listeners.get(prop).delete(callback)
}

export default store
