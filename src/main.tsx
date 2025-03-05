import React from 'react';
import ReactDOM from 'react-dom/client';
// import AppExample from './_AppExample';
import App from './App';
import './index.css';

const root = document.getElementById('root');
ReactDOM.createRoot(root as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
