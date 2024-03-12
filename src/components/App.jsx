import React from 'react';
import Track from './Track';

function App() {
    return (
      <div>
        <div className='spacer-top' />
        <div className='d-flex flex-row'>
          <div className='flex-grow-1 flex-shrink-0'>
            <Track title="Track1" trackWidth="180px" backgroundColour="#ad1b1b"/>
            <Track title="Track2" trackWidth="180px" backgroundColour="#10e8cf"/>
          </div>
        </div>
      </div>
    );
}

export default App;
