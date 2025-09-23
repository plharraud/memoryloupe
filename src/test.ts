// let a: string[] = ['a/b/c.c', 'a/b/d.c', 'a/b/c/a.c'];

let M: Map<string, any> = new Map();

function U() {
    let A = { cc: "cc" };
    M.set("cc", A);
}

U();

console.log(M);

let a = M.get("cc");

console.log(a);

let B: { children: { cc: any } } = Object({ children: {} });

B.children["cc"] = a;

console.log(B);

console.log(B.children.cc === M.get("cc"));
console.log(B.children.cc);
console.log(M.get("cc"));

let j = M.get("cc");
// j["cc"] = "CC";
Object.assign(j, { a: "AAA", cc: "ABCD" });
// M.set("cc", j);


console.log(B.children.cc === M.get("cc"));
console.log(B.children.cc);
console.log(M.get("cc"));

for (const e of M.values()) {
    e["cc"] = "DDD";
    e["a"] = 1;
}

console.log(B.children.cc === M.get("cc"));
console.log(B.children.cc);
console.log(M.get("cc"));

for (const e of Object.values(B.children)) {
    e["cc"] = "III";
    e["a"] = 0;
}

console.log(B.children.cc === M.get("cc"));
console.log(B.children.cc);
console.log(M.get("cc"));

// const tree: Record<string, any> = a.reduce((acc, path) => {
//     path.split("/").reduce((curr, part, i, arr) => {
//         if (!curr.hasOwnProperty(part)) {
//             curr[part] = (i === arr.length - 1) ? null : {};
//         }
//         return curr[part] || {};
//     }, acc);
//     return acc;
// }, Object());

// console.log(a);
// console.log(tree);

// function visit(t) {
//     let vals = (Object.values(t));
//     if (vals.length > 1) return t;
//     else return visit(vals[0]);
// }

// console.log(visit(tree));

//arm-none-eabi-objdump --syms -C -h -w build/noloop.elf
//arm-none-eabi-nm --defined-only -S -l -C -p build/noloop.elf
