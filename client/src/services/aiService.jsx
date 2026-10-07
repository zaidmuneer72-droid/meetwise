export function analyzeTranscript(transcript) {
  console.log("Analyzing transcript:", transcript);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary:
          "The team discussed progress on the current project and aligned on next steps.",
        actionItems: [
          { task: "Follow up on open questions", owner: "Zaid" },
          { task: "Share notes with the team", owner: "Ali" },
        ],
        decisions: ["Proceed with the current plan", "Revisit in next check-in"],
      });
    }, 1200);
  });
}