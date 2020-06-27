export default class Store {

	constructor(model, proxy) {
		if (!proxy) {
			throw Error('Incomplete store definition')
		}
		this.model = model
		this.proxy = proxy
		this.data = []
		this.currentPage = 1
	}

	load(options) {
		
		let {params, callback, page=1} = options

		if (!callback){
			throw Error('Callback function required for function load.')
		}
		 else {
		 	let start = params ? 0 : (this.currentPage - 1)*25

			let url = this.proxy.url + '?start=' + start + '&limit=25',
			method = this.proxy.method || 'GET',
			rootProperty = this.proxy.rootProperty,
			totalProperty = this.proxy.totalProperty

			if (params) {
				this.params = params
			}

			let urlparams = new URLSearchParams(this.params).toString()
			
			if (urlparams) {
				url += '&' + urlparams
			}

			fetch(url)
				.then((response) => {
					return response.json()
				})
				.then((jsonResponse) => {
					this.data = jsonResponse[rootProperty]
					this.currentPage = page
					callback(null, jsonResponse[rootProperty], jsonResponse[totalProperty], this.currentPage)
				})
				.catch((err) => {
					callback(err)
				})
		}
		
	}

	loadNextPage(callback) {
		this.load({
			callback,
			page: ++this.currentPage
		})
	}

	loadPreviousPage(callback) {
		this.load({
			callback,
			page: --this.currentPage
		})
	}

	getData() {
		return this.data
	}

	getProxy() {
		return this.proxy
	}
}