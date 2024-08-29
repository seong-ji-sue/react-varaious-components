import {createGlobalStyle} from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *{
    box-sizing: border-box;
  }
  html, body, #root{
    width: 100%;
    height: 100%;
  }
  html, body, div, span, h1, h2, h3, h4, h5, h6, p,
  a, dl, dt, dd, ol, ul, li, form, label, table {
    margin: 0;
    padding: 0;
    border: 0;

    color: #000000;
    font-weight: normal;
  }
  
  button {
    background: transparent;
    cursor: pointer;
  }
  
  input, textarea {
    appearance: none;
    -webkit-appearance: none;
    -webkit-border-radius: 0;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent;
    border: none;
    padding: 0;
  }
  
	div::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	div::-webkit-scrollbar-thumb {
	}
	div::-webkit-scrollbar-track {
	}
`;
