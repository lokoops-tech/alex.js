
import React from 'react'
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from './Pages/AdminLayout'
import AdminAuth from './Pages/AdminLogin';


const App = () => {
  return (
   <BrowserRouter>
    <AdminAuth />
    <AdminLayout />
</BrowserRouter>
  )
}

export default App
