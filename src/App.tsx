import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Plus, Minus, Play } from "lucide-react";
import { cn } from "./lib/utils";

interface Step {
  description: string;
  matrix: number[][];
}

export default function App() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  const [steps, setSteps] = useState<Step[]>([]);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [solution, setSolution] = useState<number[] | null>(null);

  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(4).fill(NaN))
  );

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const parsed = value === "" || value === "-" ? NaN : parseFloat(value);

    const newMatrix = matrix.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? parsed : cell))
    );

    setMatrix(newMatrix);
  };

  const updateDimensions = (newRows: number, newCols: number) => {
    if (newRows < 2 || newCols < 3 || newRows > 8 || newCols > 9) return;

    const newMatrix = Array.from({ length: newRows }, (_, i) =>
      Array.from({ length: newCols }, (_, j) => matrix[i]?.[j] ?? NaN)
    );

    setRows(newRows);
    setCols(newCols);
    setMatrix(newMatrix);
  };

  const handleSolve = () => {
    if (matrix.some((row) => row.some((cell) => isNaN(cell)))) {
      alert("Por favor, preencha todos os campos com valores numéricos.");
      return;
    }

    const matrixCopy = matrix.map((row) => [...row]);
    const numRows = matrixCopy.length;
    const numCols = matrixCopy[0].length;
    const numVars = numCols - 1;

    const newSteps: Step[] = [];

    const saveStep = (description: string) => {
      newSteps.push({
        description,
        matrix: matrixCopy.map((row) => [...row]),
      });
    };

    console.log("Matriz inicial:", JSON.stringify(matrixCopy));

    // Antes, eu tava utilizando apenas um i para controlar a linha e a coluna, se um numero do pivot era 3 em matrizes
    // irregulares, ele avançava a linha e a coluna, o que causavas erros pois uma linha poderia nunca ser processada
    // Agora, eu utilizo um pivotRow separado para controlar a linha atual do pivô, e o loop de coluna avança normalmente,
    // garantindo que todas as linhas sejam processadas corretamente, mesmo em matrizes irregulares.

    let pivotRow = 0;
    // Inicia loop para preparar a matriz para o escalonamento
    for (let col = 0; col < numVars && pivotRow < numRows; col++) {
      for (let j = pivotRow; j < numRows; j++) {
        const row = matrixCopy[j];

        // Verifica se o elemento na posição [j][col] é 1 e, se for, move essa linha para a posição [col] (linha atual) e o loop para
        if (row[col] === 1) {
          if (j === pivotRow) break; // Já está na posição correta

          const intialRowCopy = [...matrixCopy[pivotRow]];

          matrixCopy[pivotRow] = [...row];

          matrixCopy[j] = intialRowCopy;

          saveStep(`Troca L${pivotRow + 1} com L${j + 1}`);
          break;
        }

        // Se o elemento na posição [j][col] for maior que o elemento na posição [col][col], troca as linhas
        if (Math.abs(row[col]) > Math.abs(matrixCopy[pivotRow][col])) {
          const intialRowCopy = [...matrixCopy[pivotRow]];
          matrixCopy[pivotRow] = [...row];
          matrixCopy[j] = intialRowCopy;

          saveStep(`Troca L${pivotRow + 1} com L${j + 1}`);
        }
      }

      const pivot = matrixCopy[pivotRow][col];
      if (pivot === 0) continue;

      // Normaliza pivo
      for (let k = 0; k < matrixCopy[pivotRow].length; k++) {
        matrixCopy[pivotRow][k] /= pivot;
      }
      saveStep(`L${pivotRow + 1} = L${pivotRow + 1} / ${pivot}`);

      // Inicia loop para eliminar os elementos abaixo do pivô
      for (let j = 0; j < numRows; j++) {
        // Pula a linha atual
        if (j === pivotRow) continue;

        // Calcula o fator de multiplicação para eliminar o elemento na posição [j][col]
        const factor = matrixCopy[j][col];

        // Se o fator for zero, a linha já está eliminada, então pula para a próxima linha
        if (factor === 0) continue;

        // Subtrai o produto da linha atual (linha i) multiplicada pelo fator da linha j para eliminar o elemento na posição [j][i]
        for (let k = 0; k < matrixCopy[pivotRow].length; k++) {
          matrixCopy[j][k] -= factor * matrixCopy[pivotRow][k];
        }

        const signal = factor > 0 ? "-" : "+";
        saveStep(
          `L${j + 1} = L${j + 1} ${signal} ${Math.abs(factor)} × L${
            pivotRow + 1
          }`
        );
      }

      pivotRow++;
      setSteps(newSteps);
    }

    // Isso faz uma limpeza final da matriz para evitar problemas de precisão, transformando valores muito próximos de zero em exatamente zero
    // Erro que aconteceu em alguns testes
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < matrixCopy[i].length; j++) {
        if (Math.abs(matrixCopy[i][j]) < 1e-10) {
          matrixCopy[i][j] = 0;
        }
      }
    }

    // Classificação
    let type = "SPD"; // Valor temporário
    let validEquations = 0; // Quantos coeficienes validos

    for (let i = 0; i < numRows; i++) {
      const allZeroCoefs = matrixCopy[i]
        .slice(0, numVars)
        .every((v) => v === 0);
      const lastCol = matrixCopy[i][numVars];

      // 1. Condição de Sistema Impossível (0 = c)
      if (allZeroCoefs && lastCol !== 0) {
        type = "SI";
        break; // Achou uma inconsistência, não precisa checar o resto
      }

      // Se a linha tem coeficientes válidos, incrementamos o contador
      if (!allZeroCoefs) {
        validEquations++;
      }
    }

    // 2. Definindo entre SPD e SPI (se não for SI)
    if (type !== "SI") {
      if (validEquations === numVars) {
        type = "SPD";
      } else {
        type = "SPI";
      }
    }

    // Extração da solução
    let finalSolution: number[] | null = null;
    if (type === "SPD") {
      finalSolution = [];
      // Em um SPD puro e escalonado (Gauss-Jordan),
      // os valores da diagonal principal estarão corretos
      for (let i = 0; i < numVars; i++) {
        finalSolution.push(matrixCopy[i][numVars]);
      }
    }

    setSteps(newSteps);
    setSystemType(type);
    setSolution(finalSolution);

    console.log("Matriz final:", JSON.stringify(matrixCopy));
  };

  console.log(systemType === "SPD" && solution);

  return (
    <div className="flex-container gap-8 bg-background min-h-dvh justify-center items-center p-8">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Solucionador de Sistemas Lineares</CardTitle>
          <CardDescription>
            Insira os coeficientes da matriz ampliada [A|b] para iniciar o
            escalonamento.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-container items-center gap-6">
          <div className="flex-container justify-center">
            <div className="flex-container w-auto justify-center gap-6 p-4 rounded-lg border shadow-sm">
              <div className="flex-container w-40 items-center gap-2">
                <div className="flex-container justify-center">
                  <span>Equações (Linhas)</span>
                </div>
                <div className="flex-container justify-center items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateDimensions(rows - 1, cols)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-4 text-center font-semibold">{rows}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateDimensions(rows + 1, cols)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-container w-40 items-center gap-2">
                <div className="flex-container justify-center">
                  <span>Variáveis (Colunas A)</span>
                </div>
                <div className="flex-container justify-center items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateDimensions(rows, cols - 1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-4 text-center font-semibold">
                    {cols - 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateDimensions(rows, cols + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-container justify-center">
            <div
              className="grid gap-2 items-center justify-center p-6  rounded-xl border "
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(4rem, 6rem))`,
              }}
            >
              {matrix.map((row, rowIndex) =>
                row.map((cellValue, colIndex) => {
                  const isAugmentedColumn = colIndex === cols - 1;
                  return (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="number"
                      value={isNaN(cellValue) ? "" : cellValue}
                      onChange={(e) =>
                        handleCellChange(rowIndex, colIndex, e.target.value)
                      }
                      className={cn(
                        "text-center font-mono text-lg transition-all",
                        isAugmentedColumn &&
                          "bg-primary/20 border-primary focus-visible:border-primary focus-visible:ring-primary/50"
                      )}
                    />
                  );
                })
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-container justify-center mt-4">
          <Button
            onClick={handleSolve}
            size="lg"
            className="w-full max-w-md bg-primary text-lg py-6 shadow-md"
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Escalonamento
          </Button>
        </CardFooter>
      </Card>

      {steps.length > 0 && (
        <div className="flex-container max-w-4xl gap-8 justify-center">
          {steps.map((step, index) => (
            <div
              className="flex-container border rounded-xl p-4 gap-2"
              key={index}
            >
              <div className="flex-container">
                <span className="font-semibold text-sm text-muted-foreground">
                  Passo {index + 1}: {step.description}
                </span>
              </div>
              <div
                className="grid gap-1 w-fit"
                style={{
                  gridTemplateColumns: `repeat(${step.matrix[0].length}, minmax(3rem, 5rem))`,
                }}
              >
                {step.matrix.map((row, rowIndex) =>
                  row.map((val, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "text-center font-mono text-sm border rounded p-1 text-foreground",
                        colIndex === step.matrix[0].length - 1 &&
                          "bg-primary/20 border-primary"
                      )}
                    >
                      {parseFloat(val.toFixed(6))}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          <div
            className={cn(
              "border rounded-xl p-4 shadow-sm text-center text-lg font-bold",
              systemType === "SPD" &&
                "bg-green-100 text-green-800 border-green-300",
              systemType === "SPI" &&
                "bg-yellow-100 text-yellow-800 border-yellow-300",
              systemType === "SI" && "bg-red-100 text-red-800 border-red-300"
            )}
          >
            Sistema {systemType}
            {systemType === "SPD" && " — Solução única"}
            {systemType === "SPI" && " — Infinitas soluções (variável livre)"}
            {systemType === "SI" && " — Sem solução"}
          </div>

          {systemType === "SPD" && solution && (
            <div className="flex-container mt-2 text-base text-foreground font-mono font-medium">
              Solução:{" "}
              {solution.map((val, i) => (
                <span key={i} className="text-foreground">
                  {chars[i]}={parseFloat(val.toFixed(6))}
                  {i < solution.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const chars = ["x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h", "i"];
