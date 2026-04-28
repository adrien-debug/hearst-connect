// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

enum MarketRegime {
    BULL,
    SIDEWAYS,
    BEAR
}

enum SignalType {
    NONE,
    TAKE_PROFIT,
    REBALANCE,
    YIELD_ROTATE,
    INCREASE_BTC,
    REDUCE_RISK
}
