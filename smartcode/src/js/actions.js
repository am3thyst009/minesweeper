function sendGameCommand(intent, context) {
    addAction({
        type: "salute-command",
        intent: intent
    }, context);
}
