import Store from './store'

//Stores

const listStore = new Store(null, {
	url: '/movies',
	rootProperty: 'data',
	totalProperty: 'count'
})

const searchStore = new Store(null, {
	url: '/search',
	rootProperty: 'data',
	totalProperty: 'count'
})

//Components

class UserList extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			isFirstPage: listStore.currentPage == 1,
			currentCount: 0,
			isLastPage: false
		}
		console.log(this.state)
	}

	refreshListener (e) {
		e.preventDefault()
		refresh()
	}

	loadPageCallback (err, movies, count, currentPage) {
		if (err) {
			throw Error(err)
		}
		this.setState({
			isFirstPage: currentPage == 1,
			currentCount: movies.length,
			isLastPage: (movies.length) + (currentPage -1) * 25 == count
		})
		renderList(movies, count, list)
	}

	loadNextPage (e) {
		e.preventDefault()
		listStore.loadNextPage(this.loadPageCallback.bind(this))
	}

	loadPreviousPage (e) {
		e.preventDefault()
		listStore.loadPreviousPage(this.loadPageCallback.bind(this))
	}

	render() {
		return (
			<div>
				<form className="listForm">
					<h3>You have watched</h3>&nbsp;<span id="count"></span>
					<button id="refresh" onClick={(e) => this.refreshListener(e)}>Refresh</button>
				</form>
				<form className="actionForm">
					<ul>
						<li><a href="" hidden={this.state.isLastPage} onClick={(e) => this.loadNextPage(e)} >Next</a></li>
						<li><a href="" hidden={this.state.isFirstPage} onClick={(e) => this.loadPreviousPage(e)}>Previous</a></li>
					</ul>
				</form>
				<div id="list">

				</div>
			</div>
		)
	}
}

class Page extends React.Component  {
	constructor	(props) {
		super(props)
	}

	searchListener (e) {
		e.preventDefault()
		submit()
	}

	keyUpListener (e) {
		if (e.keyCode === 13) {
			e.preventDefault()
			submit()
		}
	}

	render() {
		return (
			<div>
				<h1>Saneema</h1>
				<div id="content" className="content">
					<div className="left">
						<form className="searchForm">
							<input id="title" type="text" name="title" onKeyUp={(e) => this.keyUpListener(e)}placeholder="Title"/>
							<input id="year" type="text" name="year" placeholder="Year"/>
							<button id="search" onClick={(e) => this.searchListener(e)}>Search</button>
						</form>
						<div id="result">
						</div>
					</div>
					<div className="right">
						<UserList/>
					</div>
				</div>
			</div>
		)
	} 
}

class Post extends React.Component {
	constructor(props) {
		super(props)
	}
	render () {
		return (
            <div>
        		<div className="movie">
  		          <img src={this.props.movie.Poster} width="150px"/>
	                <div className="detail">
						<p> Title - {this.props.movie.Title}</p>
						<p> Year - {this.props.movie.Year}</p>
						<p> Type - {this.props.movie.Type}</p>
						<button hidden={this.props.movie._id} onClick={() => add(this.props.movie.imdbID)}>Add</button>
						<button hidden={!this.props.movie._id} onClick={() => remove(this.props.movie.imdbID)}>Delete</button>
	                </div> 
  		        </div>
            </div>
      	)
	}
		
}

function Movies(props) {
	if (props.movies && props.movies.length) {
		return props.movies.map((movie) => {
        return (
        	<Post key={movie.imdbID} movie={movie}/> 
        )
    })
	} else {
		return (
			<span>Movie not found</span>
		)
	}
} 

document.onload = loadPage()

function loadPage() {
	ReactDOM.render(
		<Page/>,
		document.querySelector('#root')
	)	
	refresh()
}

function refresh() {
	const list = document.querySelector('#list')

	ReactDOM.unmountComponentAtNode(list)

	listStore.load({
		callback: (err, resp, count) => {
			if (err) {
				throw Error(err)
			}
			renderList(resp, count, list)
		}
	})
	// fetch('/movies')
	// 	.then((response) => {
	// 		return response.json()
	// 	})
	// 	.then((jsonResponse) => {
	// 		renderList(jsonResponse, list)
	// 	})
	// 	.catch((err) => {
	// 		console.log(err)
	// 	})
}

function submit() {

	const title = document.querySelector('#title')
	const result = document.querySelector('#result')

	ReactDOM.unmountComponentAtNode(result)
	ReactDOM.render(
		(<span>Searching ..</span>),
		result
	)
	if (title.value) {
		let params =  {
			title: title.value
		}

		if (year.value) {
			params.year = year.value
		}

		searchStore.load({
			params: {
				title: title.value,
				year
			},
			callback: (err, resp, count) => {
				if (err) {
					throw Error(err)
				}
				renderList(resp, count, result)
			}
		})
	}
	
}

function add(currentImdbID) {

	fetch('/add?imdbID=' + currentImdbID)
	.then((response) => {
		return response.json()
	})
	.then((response) => {
		if (response.success) {
			refresh()
		} else {
		}
	})
	.catch((err) => {
		status.innerHTML = 'Error'
		console.log(err)
	})
}

function remove(currentImdbID) {
	console.log('Delete from list')
	fetch('/movies/' + currentImdbID, {
		method: 'delete'
	})
	.then((response) => {
		return response.json()
	})
	.then((response) => {
		if (response.success) {
			refresh()
		} else {
		}
	})
	.catch((err) => {
		status.innerHTML = 'Error'
		console.log(err)
	})
}



function renderList(movies, total, parent) {
	ReactDOM.render(
		<Movies movies={movies}/>,
		parent
	)

	if (parent.id == 'list') {
		const count = document.querySelector('#count')
		count.innerHTML = '(' + total + ')'
	}
	
}
