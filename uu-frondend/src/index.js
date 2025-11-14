import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppHeader from './AppHeader.jsx';
import NavBar from './NavBar.jsx';
import ShoppingListDetail from './ShoppingListDetail.jsx';
import reportWebVitals from './reportWebVitals.js';

import { UserProvider, UserSelector } from './user.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserProvider>
        <UserSelector />
        <AppHeader />
        <NavBar />
    </UserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
