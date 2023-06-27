const fs = require('fs');

const input = fs.readFileSync('./entrada_boxgame.txt', 'utf8');
let linhas = input.split('\n')
const [numClausulas, numCores] = linhas[0].split(' ')

linhas = linhas.slice(1)
// output: ['q 1, q 2, r 3', 'r 1, q 2, r 3', ...]

let variaveisDistintas = linhas.join(',')
// output: 'q 1, q 2, r 3,r 1, q 2, r 3...'

variaveisDistintas = variaveisDistintas.replace(/\s/g, '')
// output: 'q1,q2,r3,r1,q2,r3...'

variaveisDistintas = variaveisDistintas.split(',')
// output: ['q1', 'q2', 'r3', 'r1', 'q2', 'r3', ...]

variaveisDistintas = [...new Set(variaveisDistintas)].sort()
// output: ['q1', 'q2', 'q3', 'q4', 'r1', 'r2', 'r3', 'r4']

variaveisDistintas = variaveisDistintas.reduce((acc, cur, i) => ({ ...acc, [cur]: i + 1 }), {})
// output: {"q1":1,"q2":2,"q3":3,"q4":4,"r1":5,"r2":6,"r3":7,"r4":8}

let output = linhas.map(linha => {
    // linha: q 1, q 2, r 3
    let linhaConvertida = linha.replace(/\s/g, '') // output: q1,q2,r3
    linhaConvertida = linhaConvertida.split(',') // output: ['q1', 'q2', 'r3']
    linhaConvertida = linhaConvertida.map(item => variaveisDistintas[item]) // output: [1, 2, 7]
    linhaConvertida = linhaConvertida.join(' ') // output: 1 2 7
    return linhaConvertida
}) // output: ['1 2 7', '5 2 7', '1 6 7', '5 6 7', '3 4', '1 8', '2 8']

output = output.join('\n')
/*
output:
1 2 7
5 2 7
1 6 7
5 6 7
3 4
1 8
2 8
*/

output = `c boxgame\np cnf ${numClausulas} ${numCores}\n${output}`
fs.writeFileSync('./entrada_dpll.txt', output, 'utf8');
