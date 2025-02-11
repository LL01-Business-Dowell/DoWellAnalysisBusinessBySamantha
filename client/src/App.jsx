import { useRecoilValue } from 'recoil';
import AnalysingPage from './components/AnalysingPage';
import EmailPage from './components/EmailPage';
import MapLinkPage from './components/MapLinkPage';
import { analysisPageEligibleAtom, emailPageEligibleAtom, mapPageEligibleAtom } from './recoil/atom';

function App() {

  const mapPageEligible = useRecoilValue(mapPageEligibleAtom);
  const emailPageEligible = useRecoilValue(emailPageEligibleAtom);
  const analysisPageEligible = useRecoilValue(analysisPageEligibleAtom);
  return (
    <div className='flex w-screen h-screen items-center justify-center'>
      <div className='flex flex-col items-center justify-center max-w-[430px] p-3'>
        {emailPageEligible && <EmailPage/> }
        {mapPageEligible && <MapLinkPage/> }
        {analysisPageEligible && <AnalysingPage/>}
      </div>
    </div>
  );
};


export default App
