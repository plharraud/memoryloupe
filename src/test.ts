let a: string[] = ['a/b/c.c', 'a/b/d.c', 'a/b/c/a.c'];


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
