import React, { useState, useEffect, useRef } from 'react';
import { SidebarVendedor } from '@/components/SidebarVendedor';
import { Disc, Sparkles, Award, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/services/api';
import { Premio } from '@/types';

export const RuletaVendedorPage: React.FC = () => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Premio | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    fetchPremios();
  }, []);

  const fetchPremios = async () => {
    try {
      const res = await api.get('/premios');
      setPremios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGirareRuleta = () => {
    if (spinning || premios.length === 0) return;

    setWinner(null);
    setSpinning(true);

    const totalPeso = premios.reduce((sum, p) => sum + p.peso, 0);
    let randomNum = Math.random() * totalPeso;
    let selectedIndex = 0;

    for (let i = 0; i < premios.length; i++) {
      if (randomNum < premios[i].peso) {
        selectedIndex = i;
        break;
      }
      randomNum -= premios[i].peso;
    }

    const selectedPremio = premios[selectedIndex];

    const numSectores = premios.length;
    const gradosPorSector = 360 / numSectores;

    const offsetSector = (numSectores - selectedIndex - 0.5) * gradosPorSector;
    const newRotation = rotation + 1800 + offsetSector;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setWinner(selectedPremio);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06d6a0', '#10b981', '#3b82f6', '#fbbf24'],
      });
    }, 4500);
  };

  const numSectores = premios.length;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sorteos & Promociones Live</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Ruleta de Premios Essence</h1>
          <p className="text-xs text-slate-400 mt-1">Gira la ruleta para otorgar premios en vivo a tus compradores.</p>
        </div>

        {winner && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/50 text-center max-w-md w-full shadow-2xl animate-bounce">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">¡Premio Concedido!</h3>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{winner.texto}</p>
          </div>
        )}

        <div className="relative w-80 h-80 sm:w-96 sm:h-96 my-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-md" />

          <div
            className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-[4500ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {premios.map((p, idx) => {
              const angle = (360 / numSectores) * idx;
              const skew = 90 - 360 / numSectores;

              return (
                <div
                  key={p.id}
                  className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center"
                  style={{
                    backgroundColor: p.color,
                    transform: `rotate(${angle}deg) skewY(-${skew}deg)`,
                  }}
                >
                  <span
                    className="text-slate-950 font-extrabold text-xs uppercase tracking-wider select-none px-2 text-center"
                    style={{
                      transform: `skewY(${skew}deg) rotate(${180 / numSectores}deg) translate(50px, -20px)`,
                    }}
                  >
                    {p.texto}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleGirareRuleta}
            disabled={spinning || premios.length === 0}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-slate-950 border-4 border-teal-500 text-teal-300 font-extrabold text-xs shadow-2xl z-20 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            {spinning ? 'GIRANDO' : 'GIRAR'}
          </button>
        </div>
      </main>
    </div>
  );
};
