import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*import React from 'react'
import {
  authReducer,
  initialAuthState,
  booksReducer,
  initialBooksState,
} from './reducer'
import { API_ROOT } from '../utils/constants'
import { post, get, del, put } from '../utils/fetch'
import {
  SET_ERROR,
  USER_LOGIN,
  USER_LOGOUT,
  SET_BOOKS,
  SELECT_BOOK,
  REMOVE_BOOK,
  ADD_BOOK,
  UPDATE_BOOK,
  TOGGLE_ADDING,
  SET_CATEGORY,
  TOGGLE_EDITING,
  TOGGLE_REGISTERING, SET_SEARCH, SET_PER_PAGE, NEXT_PAGE, PREV_PAGE,
} from './Constants'
import * as storage from '../utils/storage'

export const AuthContext = React.createContext({
  state: initialAuthState,
  dispatch: () => null,
})

export const BooksContext = React.createContext({
  state: initialBooksState,
  dispatch: () => null,
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialAuthState)

  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}

export const BooksProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(booksReducer, initialBooksState)
  const value = React.useMemo(() => [state, dispatch], [state])

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  )
}

export const useAuth = () => {
  const [state, dispatch] = React.useContext(AuthContext)

  const login = async (username, password) => {
    try {
      const response = await post(`${API_ROOT}/login`, {
        username,
        password,
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      const user = response.body
      storage.saveUser(user)
      dispatch({ type: USER_LOGIN, payload: user })

      return user

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const logout = () => {
    storage.removeUser()
    dispatch({ type: USER_LOGOUT })
    return true
  }

  const usernameExists = async username => {
    try {
      const response = await get(`${API_ROOT}/checkUsername/${username}`)

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      return response.body

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const register = async (username, password) => {
    try {
      const response = await post(`${API_ROOT}/register`, {
        username,
        password,
      })

      if (response.status === 'err') {
        throw new Error(response.body)
      }

      return true

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const getToken = () => {
    if (!state.user) return false
    return `Bearer ${state.user.jwt}`
  }

  const setRegistering = is => dispatch({ type: TOGGLE_REGISTERING, payload: is })

  const isAdmin = () => {
    if (state.user && state.user.hasOwnProperty('username'))
      return state.user.username === 'admin'
    return false
  }

  return {
    ...state,
    login,
    logout,
    register,
    usernameExists,
    getToken,
    setRegistering,
    isAdmin
  }
}

export const useBooks = () => {
  const [state, dispatch] = React.useContext(BooksContext)
  const { getToken, isAdmin } = useAuth()

  const getLength = React.useCallback(() => {
    return {
      from: ((state.page * state.perPage) - state.perPage) + 1,
      to: state.page * state.perPage
    }
  }, [state.page, state.perPage])

  const fetchBooks = React.useCallback(async () => {
    try {
      const { from, to } = getLength()
      console.log('fetchBooks from: ', from, 'to: ', to)
      const response = await get(`${API_ROOT}/books/${from}/${to}`, {
        'Authorization': getToken(),
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: SET_BOOKS, payload: response.body })
      return response.body.results

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }, [dispatch, getToken, getLength]);

  const searchBooks = React.useCallback(async (q = false) => {
    try {
      const { from, to } = getLength()
      const search = q === false ? state.search : q
      console.log('searchBooks from: ', from, 'to: ', to, 'term: ', search)
      const response = await get(`${API_ROOT}/books/search/${search}/${from}/${to}`, {
        'Authorization': getToken(),
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: SET_BOOKS, payload: response.body })
      return response.body.results

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }, [dispatch, getToken, getLength, state.search])

  const fetchAuthorBooks = React.useCallback(async (author) => {
    try {
      const { from, to } = getLength()
      console.log('fetchAuthorBooks from: ', from, 'to: ', to, 'author: ', author)
      const response = await get(
        `${API_ROOT}/books/searchByAuthor/${author}/${from}/${to}`, {
          'Authorization': getToken(),
        })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: SET_BOOKS, payload: response.body })
      return response.body.results

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }, [dispatch, getToken, getLength])

  const selectBook = id => dispatch({ type: SELECT_BOOK, payload: id })

  const removeBook = async id => {
    try {
      if (!isAdmin()) {
        return false
      }

      const response = await del(`${API_ROOT}/books/${id}`, {
        'Authorization': getToken(),
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: REMOVE_BOOK, payload: id })
      window.alert('Knjiga je uspesno obrisana')
      return true

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const updateBook = async data => {
    try {
      if (!isAdmin()) {
        return false
      }

      const response = await put(`${API_ROOT}/books/${data.id}`, data, {
        'Authorization': getToken(),
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: UPDATE_BOOK, payload: data })
      window.alert('Knjiga je uspesno sacuvana')
      return true

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const addBook = async data => {
    try {
      if (!isAdmin()) {
        
        return false
      }

      const response = await post(`${API_ROOT}/books/new`, data, {
        'Authorization': getToken(),
      })

      if (response.status === 'err') {
        dispatch({ type: SET_ERROR, payload: response.body })
        return false
      }

      dispatch({ type: ADD_BOOK, payload: response.body })
      window.alert('Knjiga je uspesno dodata')
      return response.body

    } catch (e) {
      dispatch({ type: SET_ERROR, payload: e.message })
      return false
    }
  }

  const setAdding = is => dispatch({ type: TOGGLE_ADDING, payload: is })

  const setEditing = is => dispatch({ type: TOGGLE_EDITING, payload: is })

  const setCategory = cat => dispatch({ type: SET_CATEGORY, payload: cat })

  const clearError = () => dispatch({ type: SET_ERROR, payload: false })

  const setSearch = term => dispatch({ type: SET_SEARCH, payload: term })

  const setPerPage = count => dispatch({ type: SET_PER_PAGE, payload: count })

  const nextPage = () => dispatch({ type: NEXT_PAGE })

  const prevPage = () => dispatch({ type: PREV_PAGE })

  return {
    ...state,
    fetchBooks,
    fetchAuthorBooks,
    searchBooks,
    selectBook,
    removeBook,
    updateBook,
    addBook,
    setAdding,
    setEditing,
    setCategory,
    clearError,
    setSearch,
    setPerPage,
    nextPage,
    prevPage
  }
}
*/