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

export default function App() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  const [matrix, setMatrix] = useState(
    Array.from({ length: 3 }, () => Array(4).fill(""))
  );

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (!/^-?\d*[.,]?\d*$/.test(value) && value !== "") return;

    const newMatrix = [...matrix];
    newMatrix[rowIndex][colIndex] = value.replace(",", ".");
    setMatrix(newMatrix);
  };

  const updateDimensions = (newRows: number, newCols: number) => {
    if (newRows < 2 || newCols < 3 || newRows > 8 || newCols > 9) return;

    const newMatrix = Array.from({ length: newRows }, (_, i) =>
      Array.from({ length: newCols }, (_, j) =>
        matrix[i]?.[j] !== undefined ? matrix[i][j] : ""
      )
    );

    setRows(newRows);
    setCols(newCols);
    setMatrix(newMatrix);
  };

  const handleSolve = () => {
    console.log("Matriz pronta para o cálculo:", matrix);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-lg border-slate-200">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-slate-800">
            Solucionador de Sistemas Lineares
          </CardTitle>
          <CardDescription className="text-slate-500 text-lg mt-2">
            Insira os coeficientes da matriz ampliada [A|b] para iniciar o
            escalonamento.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-8">
          <div className="flex gap-8 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Equações (Linhas)
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateDimensions(rows - 1, cols)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-4 text-center font-semibold">{rows}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateDimensions(rows + 1, cols)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-px bg-slate-200" />

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Variáveis (Colunas A)
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateDimensions(rows, cols - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-4 text-center font-semibold">
                  {cols - 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateDimensions(rows, cols + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            className="grid gap-2 items-center justify-center p-6 bg-slate-100/50 rounded-xl border border-slate-200"
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
                    type="text"
                    value={cellValue}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colIndex, e.target.value)
                    }
                    className={`text-center font-mono text-lg transition-all focus:ring-2 
                      ${
                        isAugmentedColumn
                          ? "border-l-4 border-l-blue-400 bg-blue-50/30"
                          : "bg-white"
                      }`}
                    placeholder="0"
                  />
                );
              })
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-6 pb-8 border-t border-slate-100 mt-4">
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
