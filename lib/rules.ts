import type { EvaluatedPlayer, Player } from "@/types/player";

function withResult(p: Player, result: string, reasons: string[]): EvaluatedPlayer {
  return {
    ...p,
    growth: p.potential - p.rating,
    result,
    reasons,
  };
}

function sellSoon(p: Player, reasons: string[]): EvaluatedPlayer {
  return withResult(p, "Sell Soon", reasons);
}

function div1(p: Player): EvaluatedPlayer {
  const growth = p.potential - p.rating;

  if (p.potential <= 79 || (p.rating <= 83 && p.age >= 33)) {
    const reasons: string[] = [];
    if (p.potential <= 79) reasons.push(`Potential <= 79 (${p.potential}).`);
    if (p.rating <= 83 && p.age >= 33) reasons.push(`Age >= 33 (${p.age}) and Rating <= 83 (${p.rating}).`);
    return sellSoon(p, reasons);
  }

  if (p.rating >= 85 && p.age >= 29 && p.age <= 40) {
    return withResult(p, "Leader", [`Rating >= 85 (${p.rating}) and Age 29–40 (${p.age}).`]);
  }

  if (p.rating >= 85 && p.age <= 28) {
    return withResult(p, "Star Player", [`Rating >= 85 (${p.rating}) and Age <= 28 (${p.age}).`]);
  }

  if (p.rating >= 75 && p.potential >= 85 && p.age <= 22) {
    return withResult(p, "Wonderkid", [`Age <= 22 (${p.age}), Rating >= 75 (${p.rating}), Potential >= 85 (${p.potential}).`]);
  }

  if (p.rating >= 81 && p.rating <= 84 && p.age >= 17 && p.age <= 28) {
    return withResult(p, "First Team Player", [`Rating 81–84 (${p.rating}) and Age 17–28 (${p.age}).`]);
  }

  if (p.rating >= 75 && growth >= 5) {
    return withResult(p, "Keep & Build", [`Rating >= 75 (${p.rating}) and Growth >= 5 (${growth}).`]);
  }

  if (p.rating >= 75 && p.rating <= 80 && p.age < 30 && growth < 4) {
    return withResult(p, "Back-up", [`Rating 75–80 (${p.rating}), Age < 30 (${p.age}), Growth < 4 (${growth}).`]);
  }

  if (p.rating <= 74 && p.potential >= 80) {
    return withResult(p, "Loan 1y", [`Rating <= 74 (${p.rating}) and Potential >= 80 (${p.potential}).`]);
  }

  return withResult(p, "Back-up", ["No rule triggered → default Back-up."]);
}

function div2(p: Player): EvaluatedPlayer {
  const growth = p.potential - p.rating;

  if (p.age >= 30) return sellSoon(p, [`Age >= 30 (${p.age}).`]);
  if (p.potential <= 70) return sellSoon(p, [`Potential <= 70 (${p.potential}).`]);

  if (p.rating >= 78 && p.age >= 28 && p.age <= 40) {
    return withResult(p, "Leader", [`Rating >= 78 (${p.rating}) and Age 28–40 (${p.age}).`]);
  }

  if (p.rating >= 77 && p.age >= 16 && p.age <= 29 && p.potential >= 77) {
    return withResult(p, "Star Player", [`Rating >= 77 (${p.rating}), Potential >= 77 (${p.potential}), Age 16–29 (${p.age}).`]);
  }

  if (p.age >= 16 && p.age <= 22 && p.rating >= 70 && p.potential >= 80) {
    return withResult(p, "Wonderkid", [`Age 16–22 (${p.age}), Rating >= 70 (${p.rating}), Potential >= 80 (${p.potential}).`]);
  }

  if (p.rating >= 72 && p.age >= 16 && p.age <= 29 && growth >= 1) {
    return withResult(p, "First Team Player", [`Rating >= 72 (${p.rating}), Age 16–29 (${p.age}), Growth >= 1 (${growth}).`]);
  }

  if (p.rating >= 70 && growth >= 4) {
    return withResult(p, "Keep & Build", [`Rating >= 70 (${p.rating}) and Growth >= 4 (${growth}).`]);
  }

  if (p.rating >= 71 && p.rating <= 74 && growth < 3) {
    return withResult(p, "Back-up", [`Rating 71–74 (${p.rating}) and Growth < 3 (${growth}).`]);
  }

  if (p.rating <= 69 && p.potential >= 75) {
    return withResult(p, "Loan 1y", [`Rating <= 69 (${p.rating}) and Potential >= 75 (${p.potential}).`]);
  }

  return withResult(p, "Back-up", ["No rule triggered → default Back-up."]);
}

function div3(p: Player): EvaluatedPlayer {
  const growth = p.potential - p.rating;

  if (p.age >= 30) return sellSoon(p, [`Age >= 30 (${p.age}).`]);
  if (p.rating <= 62) return sellSoon(p, [`Rating <= 62 (${p.rating}).`]);

  if (p.rating >= 75 && p.age >= 28 && p.age <= 40) {
    return withResult(p, "Leader", [`Rating >= 75 (${p.rating}) and Age 28–40 (${p.age}).`]);
  }

  if (p.rating >= 74 && p.age >= 16 && p.age <= 30 && p.potential >= 74) {
    return withResult(p, "Star Player", [`Rating >= 74 (${p.rating}), Potential >= 74 (${p.potential}), Age 16–30 (${p.age}).`]);
  }

  if (p.rating >= 65 && p.potential >= 75 && p.age <= 22) {
    return withResult(p, "Wonderkid", [`Age <= 22 (${p.age}), Rating >= 65 (${p.rating}), Potential >= 75 (${p.potential}).`]);
  }

  if (p.rating >= 68 && p.age >= 16 && p.age <= 30 && growth >= 1) {
    return withResult(p, "First Team Player", [`Rating >= 68 (${p.rating}), Age 16–30 (${p.age}), Growth >= 1 (${growth}).`]);
  }

  if (p.rating >= 65 && growth >= 4) {
    return withResult(p, "Keep & Build", [`Rating >= 65 (${p.rating}) and Growth >= 4 (${growth}).`]);
  }

  if (p.rating >= 63 && p.rating <= 65) {
    return withResult(p, "Back-up", [`Rating 63–65 (${p.rating}).`]);
  }

  if (p.rating <= 63 && p.potential >= 70 && p.age >= 16 && p.age <= 21) {
    return withResult(p, "Loan 1y", [`Rating <= 63 (${p.rating}), Potential >= 70 (${p.potential}), Age 16–21 (${p.age}).`]);
  }

  return withResult(p, "Back-up", ["No rule triggered → default Back-up."]);
}

function div4(p: Player): EvaluatedPlayer {
  const growth = p.potential - p.rating;

  if (p.age >= 29) return sellSoon(p, [`Age >= 29 (${p.age}).`]);
  if (p.potential <= 62) return sellSoon(p, [`Potential <= 62 (${p.potential}).`]);
  if (p.rating <= 59 && p.potential <= 63) {
    return sellSoon(p, [`Rating <= 59 (${p.rating}) and Potential <= 63 (${p.potential}).`]);
  }

  if (p.rating >= 66 && p.age >= 29 && p.age <= 38) {
    return withResult(p, "Leader", [`Rating >= 66 (${p.rating}) and Age 29–38 (${p.age}).`]);
  }

  if (p.rating >= 66 && p.age >= 16 && p.age <= 28 && p.potential >= 66) {
    return withResult(p, "Star Player", [`Rating >= 66 (${p.rating}), Potential >= 66 (${p.potential}), Age 16–28 (${p.age}).`]);
  }

  if (p.rating >= 60 && p.potential >= 68 && p.age <= 22) {
    return withResult(p, "Wonderkid", [`Age <= 22 (${p.age}), Rating >= 60 (${p.rating}), Potential >= 68 (${p.potential}).`]);
  }

  if (p.rating >= 64 && p.age >= 16 && p.age <= 29 && growth >= 0) {
    return withResult(p, "First Team Player", [`Rating >= 64 (${p.rating}) and Age 16–29 (${p.age}).`]);
  }

  if (p.rating >= 60 && p.potential >= 66 && p.age >= 16 && p.age <= 25) {
    return withResult(p, "Keep & Build", [`Rating >= 60 (${p.rating}), Potential >= 66 (${p.potential}), Age 16–25 (${p.age}).`]);
  }

  if (p.rating >= 60 && p.rating <= 63 && p.age >= 16 && p.age <= 29) {
    return withResult(p, "Back-up", [`Rating 60–63 (${p.rating}) and Age 16–29 (${p.age}).`]);
  }

  if (p.rating <= 59 && p.potential >= 66 && p.age >= 16 && p.age <= 21) {
    return withResult(p, "Loan 1y", [`Rating <= 59 (${p.rating}), Potential >= 66 (${p.potential}), Age 16–21 (${p.age}).`]);
  }

  return withResult(p, "Back-up", ["No rule triggered → default Back-up."]);
}

export function evaluatePlayer(p: Player, division: number): EvaluatedPlayer {
  if (division === 1) return div1(p);
  if (division === 2) return div2(p);
  if (division === 3) return div3(p);
  if (division === 4) return div4(p);
  return withResult(p, "Back-up", ["Unknown division → default Back-up."]);
}
