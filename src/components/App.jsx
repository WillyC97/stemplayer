import React from 'react';
import Track from './Track';

function App() {
    return (
        <div className='d-flex flex-row'>
          <div className='flex-grow-1 flex-shrink-0'>
            <Track backgroundColour="#ad1b1b"/>
            <Track backgroundColour="#10e8cf"/>
          </div>
        </div>
    );
}

export default App;
