const Run = ({ fetchData }) => {
  return (
    <div className='ml-3 run-button' onClick={fetchData}>
      <div className='py-2 ml-1 text-[14px] font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
        Run
      </div>
    </div>
  );
};

export default Run;
