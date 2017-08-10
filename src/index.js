import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './style/normalize.css';
import './style/skeleton.css';
import './style/style.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
