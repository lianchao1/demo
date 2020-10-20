//import {Print} from './print'
import bigImgSrc from '../images/big.png';
import 'isomorphic-fetch'
var bigImg = document.createElement("img");
bigImg.src = bigImgSrc;
document.body.appendChild(bigImg);

//fetch('http://localhost:8081/es6/page2.html').then(r=>r.text()).then( t=>$('body').append(t));
//new Print();
xbtx.b=1;
setInterval(function(){console.log(xbtx.b)},5000)


const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
