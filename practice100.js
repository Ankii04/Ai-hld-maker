// //pratice 100 Q
// console.log("Hello Guysss");
// console.log("Heelo Guysss","ANkit");
// const newdate = new Date(); // Date gives you both date AND time
// console.log(newdate.getFullYear());  // e.g. 2026
// console.log(newdate.getMonth() + 1); // e.g. 6 (months are 0-indexed, so +1)
// console.log(newdate.getDate());      // day of month, e.g. 21
// console.log(newdate.getHours());     // e.g. 19
// console.log(newdate.getMinutes());   // e.g. 57
// console.log(newdate.getSeconds());   // e.g. 16

// // const a = "ankit";
// const b = "kumar";
// console.log(`${a} ${b}`);
// console.log(`${a} ${b}`);
// console.error("error");

// var a = true;
// console.log(typeof(a));

// var age = 18;
// if(age>=18)
// {
//     console.log("correct");
// }
// else
// {
//     console.error("minm age required is 18");
// }

// let c = 10;
// c = 20;
// console.log(c);


// let d = null;
// console.log(typeof(d));

// for(let i=0;i<50;i++)
// {
//     console.log(i);
// }
// let sum = 0;
// let i=0;
// while(i<10)
// {
//     sum+=i;
//     i++;
// }
// console.log(sum);

// let z = "lava";
// for(let char of z)
// {
//     console.log(char);
// }
// let k = 5;
// do
// {
//     console.log(k);
//     k--;
// }while(k>0);

// //print 3*3 grid

// let hold = 1;
// for(let i=0;i<3;i++)
// {
//     var str = "";
//     for(let j=1;j<4;j++)
//     {
//         str += hold +" ";
//         hold++;
//     }
//     console.log(str);
// }


//reverse an array
let arr = [1,2,3,4,5];
// var st = 0;
var end = arr.length - 1;
for(var i = 0;i<Math.floor(arr.length/2);i++)
{
    let temp = arr[i];
    arr[i] = arr[end];
    arr[end] = temp;
    // st++;
    end--;

}
console.log(arr);

var c  = {
    name : "Ankit",
    age : 21,
    gender : "Male"

}

for(let key in c)
{
    console.log(c[key]);
}


var b = ["animal","stranger","tiger","lion"];
for(let c of b)
{
    console.log(c);
}

console.log(b.at(2));

b.shift(0);
b.unshift(10);
b.push(10);
b.pop();
b.splice(0,2,"dog", "cat");
console.log(b);
var h = b.slice(0,1);
console.log(h);

console.log(b.indexOf("cat"));
console.log(b.includes("ankii"));