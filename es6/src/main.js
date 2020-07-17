import {Print} from './one'
import smallImgSrc from '../images/small.png';

var smallImg = document.createElement("img");
smallImg.src = smallImgSrc;
document.body.appendChild(smallImg);

document.write('<h1>Hello World</h1>');
new Print();
$("#top").append("<span>444</span>")
