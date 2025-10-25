import React from 'react';
import Header from '../components/Header';

interface KnowledgeBasePageProps {
  onToggleSidebar: () => void;
}

const commonIssues = [
  {
    title: 'Engine Flooding',
    description: 'The Renesis engine is prone to flooding if shut off before reaching operating temperature. This happens because unburnt fuel washes oil from the rotor housings, causing a loss of compression.',
    solution: 'To prevent flooding, always let the engine warm up completely before shutting it down. If flooded, follow the "de-flooding" procedure: pull the fuel pump fuse, crank the engine to expel excess fuel, then reinstall the fuse and start again. In severe cases, spark plugs may need to be cleaned or replaced.',
    imageSuggestion: 'Upload a photo of your spark plugs after a failed start attempt. Wet, fuel-soaked plugs are a key indicator. A short video of the engine cranking without starting can also be helpful.'
  },
  {
    title: 'Ignition Coil Failure',
    description: 'Failing ignition coils are a very common issue, leading to misfires, poor performance, hesitation, and potentially catalytic converter damage. Coils should be considered a regular maintenance item.',
    solution: 'Test coils with a HEI spark tester. A weak or yellow spark indicates a failing coil. It is recommended to replace all four coils, spark plugs, and wires at the same time, typically every 30,000 miles (50,000 km).',
    imageSuggestion: 'Provide a clear picture of your ignition coils. Note any visible cracks or burn marks on the casing. If you have a spark tester, a photo or video of the weak, yellow spark would be definitive.'
  },
  {
    title: 'Low Compression / Apex Seal Wear',
    description: 'The apex seals at the tips of the rotors can wear down or get stuck due to carbon buildup, leading to low compression, difficulty starting when hot, and significant power loss.',
    solution: 'Regularly redlining the engine helps clear carbon. Using a fuel additive or performing a "seafoam" treatment can help. The ultimate solution for worn seals is an engine rebuild. A rotary-specific compression test is required for accurate diagnosis.',
    imageSuggestion: "A photo of the results from a rotary-specific compression tester is the most useful image. Also, a video of the engine struggling to start when it's hot can provide strong evidence."
  },
  {
    title: 'Catalytic Converter Clogging',
    description: 'A failing ignition system or rich fuel mixture can send unburnt fuel into the exhaust, overheating and destroying the catalytic converter. Symptoms include a "rotten egg" smell, glowing red cat, and severe power loss.',
    solution: 'Address the root cause (ignition, fuel) immediately. If the cat is clogged, it must be replaced. A high-flow catalytic converter or mid-pipe is a common aftermarket upgrade, but may not be street legal in all areas.',
    imageSuggestion: "A picture of the catalytic converter, especially if it's glowing red after a drive, is a clear sign. A photo of the exhaust tip showing heavy carbon buildup can also be a clue."
  },
    {
    title: '  Oil Consumption',
    description: 'The Renesis engine is designed to inject oil into the combustion chamber to lubricate the seals. It is normal for it to consume oil. Not monitoring oil levels is a primary cause of engine failure.',
    solution: 'Check the engine oil level every other fuel fill-up. Top up as needed with a conventional 5W-20 or 5W-30 oil (or a rotary-specific oil). Consider installing a SOHN adapter to inject clean 2-stroke oil instead of dirty engine oil.',
    imageSuggestion: 'While hard to photograph directly, you can upload a picture of your dipstick to show the oil level and condition. Also, a photo of any visible oil leaks around the engine bay or underneath the car is very helpful.'
  },
];

const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onToggleSidebar }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
      <Header
        sessionName="Knowledge Base"
        onToggleSidebar={onToggleSidebar}
      />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Common Renesis Engine Issues</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-3xl">
          This page provides a quick reference for some of the most common problems encountered by Mazda RX-8 owners.
          For a specific diagnosis, please start a new diagnosis session.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commonIssues.map((issue, index) => (
            <div key={index} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-900/40">
                <h2 className="text-xl font-semibold text-rose-500 mb-4">{issue.title}</h2>
                
                <div className="space-y-4 flex-grow">
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Symptoms</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{issue.description}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Solution</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{issue.solution}</p>
                    </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/70">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Diagnostic Media</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">{issue.imageSuggestion}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;