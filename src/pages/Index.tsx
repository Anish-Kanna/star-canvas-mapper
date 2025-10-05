import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Point {
  x: number;
  y: number;
}

interface Constellation {
  name: string;
  points: Point[];
  description: string;
}

const constellations: Constellation[] = [
  {
    name: "Orion",
    points: [
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 1 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
    ],
    description: "The Hunter",
  },
  {
    name: "Big Dipper",
    points: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
    ],
    description: "Part of Ursa Major",
  },
  {
    name: "Cassiopeia",
    points: [
      { x: 1, y: 3 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 2 },
      { x: 5, y: 3 },
    ],
    description: "The Queen",
  },
  {
    name: "Leo",
    points: [
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 3 },
      { x: 6, y: 2 },
      { x: 5, y: 1 },
    ],
    description: "The Lion",
  },
];

const Index = () => {
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [matchedConstellation, setMatchedConstellation] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridSize = 8;
  const dotSize = 12;
  const spacing = 70;

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw example constellation
    if (showExample) {
      const exampleConstellation = constellations[0]; // Show Orion
      ctx.strokeStyle = "hsl(280 100% 70%)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "hsl(280 100% 60%)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      exampleConstellation.points.forEach((point, index) => {
        const x = point.x * spacing + spacing;
        const y = point.y * spacing + spacing;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw connections
    if (connectedPoints.length > 1) {
      ctx.strokeStyle = "hsl(190 100% 60%)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "hsl(190 100% 50%)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      connectedPoints.forEach((point, index) => {
        const x = point.x * spacing + spacing;
        const y = point.y * spacing + spacing;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw dots
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * spacing + spacing;
        const y = j * spacing + spacing;

        const isConnected = connectedPoints.some((p) => p.x === i && p.y === j);

        ctx.beginPath();
        ctx.arc(x, y, isConnected ? dotSize : dotSize * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = isConnected ? "hsl(190 100% 85%)" : "hsl(190 100% 70%)";
        ctx.shadowBlur = isConnected ? 20 : 10;
        ctx.shadowColor = "hsl(190 100% 50%)";
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    drawGrid();
  }, [connectedPoints, showExample]);

  useEffect(() => {
    if (connectedPoints.length > 0) {
      checkConstellation();
    }
  }, [connectedPoints]);

  const getPointFromCoords = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const dotX = i * spacing + spacing;
        const dotY = j * spacing + spacing;
        const distance = Math.sqrt((x - dotX) ** 2 + (y - dotY) ** 2);

        if (distance < dotSize * 2) {
          return { x: i, y: j };
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPointFromCoords(e.clientX, e.clientY);
    if (point) {
      setIsDrawing(true);
      setConnectedPoints([point]);
      setMatchedConstellation(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getPointFromCoords(e.clientX, e.clientY);
    if (point) {
      const lastPoint = connectedPoints[connectedPoints.length - 1];
      if (!lastPoint || point.x !== lastPoint.x || point.y !== lastPoint.y) {
        const isAlreadyConnected = connectedPoints.some(
          (p) => p.x === point.x && p.y === point.y
        );
        if (!isAlreadyConnected) {
          setConnectedPoints([...connectedPoints, point]);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const checkConstellation = () => {
    for (const constellation of constellations) {
      if (connectedPoints.length !== constellation.points.length) continue;

      const isMatch = constellation.points.every((constellationPoint) =>
        connectedPoints.some(
          (connectedPoint) =>
            connectedPoint.x === constellationPoint.x &&
            connectedPoint.y === constellationPoint.y
        )
      );

      if (isMatch) {
        setMatchedConstellation(constellation.name);
        toast.success(`🌟 Constellation Discovered: ${constellation.name}`, {
          description: constellation.description,
          duration: 5000,
        });
        return;
      }
    }
  };

  const handleReset = () => {
    setConnectedPoints([]);
    setMatchedConstellation(null);
    setIsDrawing(false);
  };

  const toggleExample = () => {
    setShowExample(!showExample);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[image:var(--gradient-cosmic)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-star rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Constellation Matcher
            </h1>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">
            Connect the stars to discover constellations
          </p>
        </div>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <canvas
            ref={canvasRef}
            width={gridSize * spacing + spacing * 2}
            height={gridSize * spacing + spacing * 2}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair rounded-lg"
            style={{ 
              background: "radial-gradient(circle at center, hsl(230 30% 12%), hsl(230 35% 7%))",
            }}
          />
        </Card>

        <div className="flex flex-col items-center gap-4">
          {matchedConstellation && (
            <div className="px-8 py-4 bg-primary/20 backdrop-blur-sm border-2 border-primary rounded-lg animate-in fade-in slide-in-from-bottom-4">
              <p className="text-2xl font-bold text-primary text-center">
                ✨ {matchedConstellation} ✨
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={toggleExample}
              variant="outline"
              size="lg"
              className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {showExample ? "Hide Example" : "Show Example"}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>

          <div className="mt-6 p-4 bg-card/60 backdrop-blur-sm rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold text-primary mb-2">Available Constellations:</h3>
            <ul className="space-y-1 text-muted-foreground">
              {constellations.map((c) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-star rounded-full" />
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm">- {c.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
