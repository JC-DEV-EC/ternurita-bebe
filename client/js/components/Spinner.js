export function renderSpinner(container, small = false) {
  const size = small ? 'spinner-sm' : ''
  container.innerHTML = `<div class="flex justify-center items-center py-8"><div class="spinner ${size}"></div></div>`
}

export function createSpinnerHTML(small = false) {
  const size = small ? 'spinner-sm' : ''
  return `<div class="flex justify-center items-center py-8"><div class="spinner ${size}"></div></div>`
}
