const fs = require('fs'); //importa o módulo File System para poder manipular os arquivos

function readFormula(filename) {//recebe o arquivo, e retorna a formula
  const fileData = fs.readFileSync(filename, 'utf8');
  const lines = fileData.split('\n');
  let clauses = [];

  for (let line of lines) {
    line = line.trim();

    if (line === '' || line.startsWith('c') || line.startsWith('p')) {
      continue;
    }

    const literals = line.split(' ').map(Number);
    clauses.push(literals.slice(0, -1));
  }

  const [numVariables, numClauses] = lines
    .find(line => line.startsWith('p'))
    .split(' ')
    .slice(2)
    .map(Number);

  return { numVariables, numClauses, clauses };
}

function dpll(formula) {
  const valuation = {};
  const result = dpllRecursive(formula, valuation);

  if (result) {
    const trueLiterals = [];

    for (const [variable, value] of Object.entries(result)) {
      if (value === true) {
        trueLiterals.push(parseInt(variable));
      } else {
        trueLiterals.push(parseInt(variable) * -1);
      }
    }

    return trueLiterals.join(' ') + ' 0';
  }

  return 'UNSATISFIABLE';
}

function dpllRecursive(formula, valuation) {
  if (!formula || formula.length === 0) {
    return valuation;
  }

  if (!Symbol.iterator in Object(formula)) {
    formula = [formula]; // Converter para uma matriz se não for iterável
  }

  for (const clause of formula) {
    if (clause.length === 0) {
      return null;
    }

    let unitLiteral = null;

    if (clause.length === 1) {
      unitLiteral = clause[0];
    }

    if (unitLiteral) {
      const chosenLiteral = Math.abs(unitLiteral);
      const variable = chosenLiteral.toString();

      if (valuation.hasOwnProperty(variable)) {
        if (valuation[variable] !== (unitLiteral > 0)) {
          return null;
        }
      } else {
        valuation[variable] = unitLiteral > 0;
      }

      const remainingFormula = formula.filter(c => !c.includes(unitLiteral));
      return dpllRecursive(remainingFormula, valuation);
    }
  }

  const pureLiterals = findPureLiterals(formula);

  if (pureLiterals.length > 0) {
    const chosenLiteral = pureLiterals[0];
    const variable = Math.abs(chosenLiteral).toString();

    if (valuation.hasOwnProperty(variable)) {
      if (valuation[variable] !== (chosenLiteral > 0)) {
        return null;
      }
    } else {
      valuation[variable] = chosenLiteral > 0;
    }

    const remainingFormula = formula.filter(c => !c.includes(chosenLiteral));
    return dpllRecursive(remainingFormula, valuation);
  }

  const chosenLiteral = formula[0][0];
  const variable = Math.abs(chosenLiteral).toString();

  if (valuation.hasOwnProperty(variable)) {
    if (valuation[variable] !== (chosenLiteral > 0)) {
      return null;
    }
  } else {
    valuation[variable] = chosenLiteral > 0;
  }

  let remainingFormula = formula.filter(c => !c.includes(chosenLiteral));
  let result = dpllRecursive(remainingFormula, valuation);

  if (result) {
    return result;
  }

  delete valuation[variable];
  valuation[variable] = chosenLiteral > 0;

  remainingFormula = formula.filter(c => !c.includes(-chosenLiteral));
  result = dpllRecursive(remainingFormula, valuation);

  if (result) {
    return result;
  }

  delete valuation[variable];
  return null;
}

function findPureLiterals(formula) {
  const literals = {};

  for (const clause of formula) {
    for (const literal of clause) {
      const variable = Math.abs(literal).toString();
      literals[variable] = literals[variable] || (literal > 0);
    }
  }

  const pureLiterals = [];

  for (const [variable, isPositive] of Object.entries(literals)) {
    if ((isPositive && !literals.hasOwnProperty('-' + variable)) ||
        (!isPositive && !literals.hasOwnProperty(variable))) {
      pureLiterals.push(parseInt(variable) * (isPositive ? 1 : -1));
    }
  }

  return pureLiterals;
}

// Função para testar a satisfatibilidade de uma fórmula CNF
function testSatisfiability(filename) {
  const formula = readFormula(filename);
  const result = dpll(formula.clauses);

  if (result === 'UNSATISFIABLE') {
    console.log('UNSATISFIABLE');
    writeOutputFile('saida.txt', result);
  } else {
    console.log(result);
    writeOutputFile('saida.txt', result);
  }
}

function writeOutputFile(filename, content) {
    fs.writeFileSync(filename, content, 'utf8');
}

// Chamar a função de teste com o nome do arquivo CNF como argumento
testSatisfiability('entrada.txt');