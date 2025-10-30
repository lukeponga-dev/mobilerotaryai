import React, { useState, useMemo } from 'react';
import { MessageContent } from '../components/Message';
import { generateKnowledgeArticle } from '../services/geminiService';
import Button from '../components/Button';
import { SearchIcon, XIcon, LinkIcon, SparkPlugIcon, BoltIcon, PressureGaugeIcon, ExhaustFumesIcon, OilCanIcon } from '../components/icons';
import { ArticleData } from '../types';
import { technicalTerms } from '../data/technicalTerms';
import Tooltip from '../components/Tooltip';

const commonIssues = [
  {
    title: 'Engine Flooding',
    Icon: SparkPlugIcon,
    keywords: ['engine flooding', 'flooded engine', 'de-flooding'],
    description: 'The Renesis engine is prone to flooding if shut off before reaching operating temperature. This happens because unburnt fuel washes oil from the rotor housings, causing a loss of compression.',
    solution: 'To prevent flooding, always let the engine warm up completely before shutting it down. If flooded, follow the "de-flooding" procedure: pull the fuel pump fuse, crank the engine to expel excess fuel, then reinstall the fuse and start again. In severe cases, spark plugs may need to be cleaned or replaced.',
    imageSuggestion: 'Upload a photo of your spark plugs after a failed start attempt. Wet, fuel-soaked plugs are a key indicator. A short video of the engine cranking without starting can also be helpful.'
  },
  {
    title: 'Ignition Coil Failure',
    Icon: BoltIcon,
    keywords: ['ignition coil failure', 'ignition coils', 'ignition coil'],
    description: 'Failing ignition coils are a very common issue, leading to misfires, poor performance, hesitation, and potentially catalytic converter damage. Coils should be considered a regular maintenance item.',
    solution: 'Test coils with a HEI spark tester. A weak or yellow spark indicates a failing coil. It is recommended to replace all four coils, spark plugs, and wires at the same time, typically every 30,000 miles (50,000 km).',
    imageSuggestion: 'Provide a clear picture of your ignition coils. Note any visible cracks or burn marks on the casing. If you have a spark tester, a photo or video of the weak, yellow spark would be definitive.'
  },
  {
    title: 'Low Compression / Apex Seal Wear',
    Icon: PressureGaugeIcon,
    keywords: ['low compression', 'apex seal wear', 'apex seals', 'compression test'],
    description: 'The apex seals at the tips of the rotors can wear down or get stuck due to carbon buildup, leading to low compression, difficulty starting when hot, and significant power loss.',
    solution: 'Regularly redlining the engine helps clear carbon. Using a fuel additive or performing a "seafoam" treatment can help. The ultimate solution for worn seals is an engine rebuild. A rotary-specific compression test is required for accurate diagnosis.',
    imageSuggestion: "A photo of the results from a rotary-specific compression tester is the most useful image. Also, a video of the engine struggling to start when it's hot can provide strong evidence."
  },
  {
    title: 'Catalytic Converter Clogging',
    Icon: ExhaustFumesIcon,
    keywords: ['catalytic converter clogging', 'catalytic converter', 'clogged cat'],
    description: 'A failing ignition system or rich fuel mixture can send unburnt fuel into the exhaust, overheating and destroying the catalytic converter. Symptoms include a "rotten egg" smell, glowing red cat, and severe power loss.',
    solution: 'Address the root cause (ignition, fuel) immediately. If the cat is clogged, it must be replaced. A high-flow catalytic converter or mid-pipe is a common aftermarket upgrade, but may not be street legal in all areas.',
    imageSuggestion: "A picture of the catalytic converter, especially if it's glowing red after a drive, is a clear sign. A photo of the exhaust tip showing heavy carbon buildup can also be a clue."
  },
    {
    title: 'Oil Consumption',
    Icon: OilCanIcon,
    keywords: ['oil consumption', 'burning oil', 'oil level'],
    description: 'The Renesis engine is designed to inject oil into the combustion chamber to lubricate the seals. It is normal for it to consume oil. Not monitoring oil levels is a primary cause of engine failure.',
    solution: 'Check the engine oil level every other fuel fill-up. Top up as needed with a conventional 5W-20 or 5W-30 oil (or a rotary-specific oil). Consider installing a SOHN adapter to inject clean 2-stroke oil instead of dirty engine oil.',
    imageSuggestion: 'While hard to photograph directly, you can upload a picture of your dipstick to show the oil level and condition. Also, a photo of any visible oil leaks around the engine bay or underneath the car is very helpful.'
  },
];

const LoadingSkeleton = () => (
    <div className="bg-light-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg border border-light-border dark:border-dark-border shadow-lg animate-pulse">
        <div className="h-8 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-3/4 mb-6"></div>
        <div className="space-y-4">
            <div className="h-4 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-1/4 mb-2"></div>
            <div className="h-3.5 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-full"></div>
            <div className="h-3.5 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-5/6"></div>
        </div>
        <div className="space-y-4 mt-6">
            <div className="h-4 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-1/4 mb-2"></div>
            <div className="h-3.5 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-full"></div>
            <div className="h-3.5 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-full"></div>
            <div className="h-3.5 bg-light-panel-muted dark:bg-dark-panel-muted rounded w-2/3"></div>
        </div>
    </div>
);


const KnowledgeBasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);

  const { keywordMap, techTermsMap, combinedRegex } = useMemo(() => {
    const keywordMap = new Map<string, string>();
    const allKeywords = commonIssues.flatMap(issue => issue.keywords);
    commonIssues.forEach(issue => {
        issue.keywords.forEach(keyword => {
            keywordMap.set(keyword.toLowerCase(), issue.title);
        });
    });

    const techTermsKeys = Object.keys(technicalTerms);
    const techTermsMap = new Map(techTermsKeys.map(key => [key.toLowerCase(), technicalTerms[key]]));
    
    const allTerms = [...new Set([...techTermsKeys, ...allKeywords])];
    allTerms.sort((a, b) => b.length - a.length);
    const combinedRegex = new RegExp(`\\b(${allTerms.join('|')})\\b`, 'gi');

    return { keywordMap, techTermsMap, combinedRegex };
  }, []);

  const handleSearch = async (term: string) => {
    if (!term.trim() || isLoading) return;
    setIsLoading(true);
    setArticle(null);
    setSearchTerm(term);
    try {
        const generatedArticle = await generateKnowledgeArticle(term);
        setArticle(generatedArticle);
    } catch (error: any) {
        setArticle({
            text: `**Error Generating Article**\n\nI couldn't generate the article on "${term}".\n\n**Reason:** ${error.message || 'An unknown error occurred.'}`,
            sources: []
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
      setSearchTerm('');
      setArticle(null);
  };

  const renderArticleText = (text: string): React.ReactNode[] => {
    if (!text) return [text];
    
    const parts = text.split(combinedRegex);

    return parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        
        // Priority 1: Check for internal link keyword
        const topicTitle = keywordMap.get(lowerPart);
        if (topicTitle && searchTerm.toLowerCase() !== topicTitle.toLowerCase()) {
            return (
                <button
                    key={`${part}-${index}`}
                    onClick={() => handleSearch(topicTitle)}
                    className="text-accent hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                    {part}
                </button>
            );
        }

        // Priority 2: Check for technical term tooltip
        const definition = techTermsMap.get(lowerPart);
        if (definition) {
             return <Tooltip key={`${part}-${index}`} content={definition}>{part}</Tooltip>;
        }

        return part; // Return plain text if no match
    });
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto scroll-smooth bg-light-bg dark:bg-dark-bg">
      <div className="sticky top-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm z-10 py-4 -my-4 mb-4">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">Renesis Knowledge Base</h1>
          <p className="text-light-muted dark:text-dark-muted mb-6 max-w-3xl">
              Browse common issues or search for a specific topic to get a detailed, AI-generated article grounded in up-to-date web results.
          </p>
          <form onSubmit={handleSearchFormSubmit} className="flex gap-2">
              <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a topic (e.g., 'SOHN adapter benefits')..."
                  className="flex-1 bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition border border-light-border dark:border-dark-border"
                  disabled={isLoading}
              />
              <Button type="submit" variant="primary" size="icon" disabled={isLoading || !searchTerm.trim()} aria-label="Search">
                  <SearchIcon className="w-5 h-5" />
              </Button>
          </form>
      </div>

      {isLoading && <LoadingSkeleton />}
      
      {article && (
          <div>
              <Button onClick={clearSearch} variant="secondary" className="mb-4 gap-2">
                  <XIcon className="w-4 h-4" />
                  Back to Common Issues
              </Button>
              <div className="bg-light-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg border border-light-border dark:border-dark-border shadow-lg prose-slate dark:prose-invert max-w-none text-light-text dark:text-dark-text">
                  <MessageContent text={article.text} renderText={renderArticleText} />
                   {article.sources && article.sources.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-light-border dark:border-dark-border">
                          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">Sources</h3>
                          <ul className="space-y-2 list-none p-0">
                              {article.sources.map((source, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                      <LinkIcon className="w-4 h-4 text-dark-muted mt-1 flex-shrink-0" />
                                      <a 
                                          href={source.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-accent hover:underline text-sm"
                                      >
                                          {source.title || source.uri}
                                      </a>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
          </div>
      )}
      
      {!article && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {commonIssues.map((issue, index) => (
              <div key={index} className="bg-light-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg border border-light-border dark:border-dark-border flex flex-col shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-accent pr-4">{issue.title}</h2>
                    <issue.Icon className="w-8 h-8 text-light-muted dark:text-dark-muted flex-shrink-0" />
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                      <div>
                          <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-1.5 uppercase tracking-wider">Symptoms</h3>
                          <p className="text-sm text-light-muted dark:text-dark-muted">{issue.description}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-1.5 uppercase tracking-wider">Solution</h3>
                          <p className="text-sm text-light-muted dark:text-dark-muted">{issue.solution}</p>
                      </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-light-border dark:border-dark-border/70">
                      <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-1.5 uppercase tracking-wider">Diagnostic Media</h3>
                      <p className="text-sm text-light-muted dark:text-dark-muted italic">{issue.imageSuggestion}</p>
                  </div>
              </div>
          ))}
          </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;