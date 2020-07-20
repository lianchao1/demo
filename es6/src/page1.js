import {Print} from './print'
import bigImgSrc from '../images/big.png';

var bigImg = document.createElement("img");
bigImg.src = bigImgSrc;
document.body.appendChild(bigImg);

document.write('<h1>Hello World</h1>');
new Print();
