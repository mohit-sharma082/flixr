import React from 'react';

const loading = () => {
  return (
    <div className={'h-screen w-screen bg-black flex items-center justify-center'}>
        <img src={'/dot-spinner.svg'} alt="Loading..." className='h-24 w-24' />
    </div>
  )
}

export default loading