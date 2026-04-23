export enum Suit {
  Clubs = 0,
  Diamonds,
  Hearts,
  Spades,
}
export const suits = Object.values(Suit).filter((x) => typeof x == "number");
export const suitNames = ["c", "d", "h", "s"];

export const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
export const rankNames = [
  "",
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export enum HandType {
  HighCard = 0,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush,
}

export class Card {
  constructor(
    public readonly rank: number,
    public readonly suit: Suit,
  ) {}
}

export class EvaluatedHand {
  public type: HandType;
  public ranks: number[];
  public cards: Card[];
  public info: number[];

  constructor(cards: Card[]) {
    const sortedRanks = cards.map((c) => c.rank).toSorted((a, b) => b - a);
    this.cards = cards.toSorted((a, b) => b.rank - a.rank);

    let rankCounts = new Array(16).fill(0);
    let suitCounts = new Array(4).fill(0);

    for (const c of this.cards) {
      rankCounts[c.rank] += 1;
      suitCounts[c.suit] += 1;
    }

    const uniqueRanks = [...new Set(sortedRanks)];
    const fiveHighStraight =
      JSON.stringify(sortedRanks) == JSON.stringify([14, 5, 4, 3, 2]);
    const straight =
      (uniqueRanks.length == 5 && uniqueRanks[0]! - uniqueRanks[4]! == 4) ||
      fiveHighStraight;
    const flush = suitCounts.some((x) => x == 5);

    let pairs = 0;
    let threeOfAKind = false;
    let fourOfAKind = false;

    for (let i = 14; i >= 2; i--) {
      const count = rankCounts[i];
      if (count >= 4) fourOfAKind = true;
      else if (count >= 3) threeOfAKind = true;
      else pairs += Math.floor(count / 2);
    }

    const fullHouse = threeOfAKind && pairs >= 1;
    const [triple] = rankCounts.entries().find(([_, v]) => v == 3) ?? [
      undefined,
    ];
    const [pair] = rankCounts.entries().find(([_, v]) => v == 2) ?? [undefined];

    if (flush && straight) {
      if (sortedRanks[0] == 14) {
        this.type = HandType.RoyalFlush;
        this.info = [sortedRanks[0]!];
      } else {
        this.type = HandType.StraightFlush;
        if (fiveHighStraight) {
          this.info = [sortedRanks[1]!];
        } else {
          this.info = [sortedRanks[0]!];
        }
      }
    } else if (fourOfAKind) {
      this.type = HandType.FourOfAKind;
      this.info = [sortedRanks[1]!];
    } else if (fullHouse) {
      this.type = HandType.FullHouse;
      this.info = [triple!, pair!];
    } else if (flush) {
      this.type = HandType.Flush;
      this.info = [];
    } else if (straight) {
      this.type = HandType.Straight;
      if (fiveHighStraight) {
        this.info = [sortedRanks[1]!];
      } else {
        this.info = [sortedRanks[0]!];
      }
    } else if (threeOfAKind) {
      this.type = HandType.ThreeOfAKind;
      this.info = [sortedRanks[2]!];
    } else if (pairs >= 2) {
      this.type = HandType.TwoPair;
      this.info = [sortedRanks[1]!, sortedRanks[3]!];
    } else if (pairs >= 1) {
      this.type = HandType.OnePair;
      const [i] = rankCounts.entries().find(([_, v]) => v >= 2)!;
      this.info = [i];
    } else {
      this.type = HandType.HighCard;
      this.info = [sortedRanks[0]!];
    }

    if (fiveHighStraight) {
      this.ranks = [5, 4, 3, 2, 1];
    } else if (fullHouse) {
      this.ranks = [triple!, triple!, triple!, pair!, pair!];
    } else {
      this.ranks = sortedRanks.toSorted((a, b) => {
        if (rankCounts[a] != rankCounts[b])
          return rankCounts[b] - rankCounts[a];
        return b - a;
      });
    }
  }

  compare(b: EvaluatedHand): number {
    if (this.type != b.type) return this.type - b.type;
    for (let i = 0; i < this.ranks.length; i++) {
      if (this.ranks[i] != b.ranks[i]) return this.ranks[i]! - b.ranks[i]!;
    }
    return 0;
  }
}

export interface HandResult {
  bestHand: EvaluatedHand;
  indices: number[];
}

export function bestHand(
  holeCards: Card[],
  communityCards: Card[],
): HandResult {
  const allCards = [...holeCards, ...communityCards];
  const n = allCards.length;
  let bestResult: HandResult | null = null;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          for (let m = l + 1; m < n; m++) {
            const indices = [i, j, k, l, m];
            const cards = indices.map((x) => allCards[x]!);
            const evaluated = new EvaluatedHand(cards);
            if (!bestResult || evaluated.compare(bestResult.bestHand) > 0) {
              bestResult = {
                bestHand: evaluated,
                indices,
              };
            }
          }
        }
      }
    }
  }

  return bestResult!;
}
