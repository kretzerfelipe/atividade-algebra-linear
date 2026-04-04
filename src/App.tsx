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

export default function App() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(4).fill(NaN)),
  );

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    const parsed = value === "" || value === "-" ? NaN : parseFloat(value);

    const newMatrix = matrix.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? parsed : cell)),
    );

    setMatrix(newMatrix);
  };

  const updateDimensions = (newRows: number, newCols: number) => {
    if (newRows < 2 || newCols < 3 || newRows > 8 || newCols > 9) return;

    const newMatrix = Array.from({ length: newRows }, (_, i) =>
      Array.from({ length: newCols }, (_, j) => matrix[i]?.[j] ?? NaN),
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

    console.log("Matriz inicial:", JSON.stringify(matrixCopy));

    // Inicia loop para preparar a matriz para o escalonamento
    for (let i = 0; i < Math.min(numRows, numVars); i++) {
      for (let j = i; j < numRows; j++) {
        const row = matrixCopy[j];

        // Verifica se o elemento na posição [j][i] é 1 e, se for, move essa linha para a posição [i] (linha atual) e o loop para
        if (row[i] === 1) {
          if (j === i) break; // Já está na posição correta

          const intialRowCopy = [...matrixCopy[i]];

          matrixCopy[i] = [...row];

          matrixCopy[j] = intialRowCopy;
          break;
        }

        // Se o elemento na posição [j][i] for maior que o elemento na posição [i][i], troca as linhas
        if (Math.abs(row[i]) > Math.abs(matrixCopy[i][i])) {
          const intialRowCopy = [...matrixCopy[i]];

          matrixCopy[i] = [...row];

          matrixCopy[j] = intialRowCopy;
        }
      }

      const pivot = matrixCopy[i][i];
      if (pivot === 0) continue;

      for (let k = 0; k < matrixCopy[i].length; k++) {
        matrixCopy[i][k] /= pivot;
      }

      // Inicia loop para eliminar os elementos abaixo do pivô
      for (let j = 0; j < numRows; j++) {
        // Pula a linha atual
        if (j === i) continue;

        // Calcula o fator de multiplicação para eliminar o elemento na posição [j][i]
        const factor = matrixCopy[j][i];

        // Se o fator for zero, a linha já está eliminada, então pula para a próxima linha
        if (factor === 0) continue;

        // Subtrai o produto da linha atual (linha i) multiplicada pelo fator da linha j para eliminar o elemento na posição [j][i]
        for (let k = 0; k < matrixCopy[i].length; k++) {
          matrixCopy[j][k] -= factor * matrixCopy[i][k];
        }
      }
    }

    console.log("Matriz final:", JSON.stringify(matrixCopy));
  };

  return (
    <div className="flex-container min-w-dvw bg-background min-h-dvh justify-center items-center">
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
                          "bg-primary/20 border-primary focus-visible:border-primary focus-visible:ring-primary/50",
                      )}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-container justify-center mt-4">
          <Button
            onClick={handleSolve}
            size="lg"
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-md"
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Escalonamento
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
