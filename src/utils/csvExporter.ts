export function downloadCsvSample(automationId: string) {
  let csvContent = "data:text/csv;charset=utf-8,";

  if (automationId === 'candidatures-envoyees') {
    csvContent += "Date,Title,Company,Location,Status,Link\\n";
    csvContent += "16/11/2026,Senior DevOps Engineer,CloudScale Inc.,Paris,Candidature envoyée,https://myjobs.indeed.com/viewjob?jk=abc123xyz\\n";
    csvContent += "14/11/2026,Full Stack TypeScript,NovaTech Labs,Lyon,Candidature consultée,https://myjobs.indeed.com/viewjob?jk=def456uvw\\n";
  } else if (automationId === 'candidatures-gmail') {
    csvContent += "Date,Sender,Subject,Category\\n";
    csvContent += "16/11/2026,Hellowork,Votre candidature a bien été reçue,Response\\n";
    csvContent += "15/11/2026,LinkedIn Job Alerts,5 new DevOps jobs in Paris,Alert\\n";
  } else {
    csvContent += "Date,Title,Status\\n";
    csvContent += "16/11/2026,Réponse à l'offre de CloudScale Inc.,Faite\\n";
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${automationId}-sample-export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
