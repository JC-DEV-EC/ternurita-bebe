export default function render() {
  return `
    <div class="max-w-3xl mx-auto px-4 py-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div class="bg-white rounded-xl shadow-md p-6">
        <form id="checkout-form">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" class="input-field" placeholder="Calle y número" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input type="text" class="input-field" placeholder="Ciudad" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" class="input-field" placeholder="Teléfono" required>
            </div>
          </div>
          <button type="submit" class="btn-primary w-full mt-6">Confirmar pedido</button>
        </form>
      </div>
    </div>
  `
}
