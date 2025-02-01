import Button from './Button';
import Input from './Input';
export const PressetsModal = ({ isOpen, onClose }: any) => {
	return (
		isOpen && (
			<div className="fixed inset-0 z-20 flex items-center justify-center ">
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
					onClick={onClose}
				/>
				<div className="relative text-gray-300 border border-gray-800   bg-zinc-950 w-[600px] max-h-[80vh] rounded-xl shadow-xl">
					<div className="text-center pt-6">
						<h2 className="text-2xl font-bold">Presets configuration</h2>
					</div>
					<div className="px-6 py-4 overflow-y-auto">
						<form className="space-y-4 " action="">
							<Input id="title" placeholder="" label={'Preset Name'} />
							<Input id="include" placeholder="" label={'Files to include'} />
							<Input id="exclude" placeholder="" label={'Files to exclude'} />

							<textarea
								name=""
								className="bg-zinc-800 w-full rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
								id="content"
								rows={5}
								cols={5}
								placeholder="Content"
							></textarea>
							<div className="flex justify-between ">
								<Button
									onClick={() => console.log('save')}
									className="border-none px-6 py-2 text-sm text-white rounded-full tracking-tight outline-none bg-blue-600 hover:bg-blue-800 transition-all"
								>
									Save
								</Button>
								<Button
									onClick={() => console.log('Delete')}
									className="border-none px-6 py-2 text-sm text-white rounded-full tracking-tight outline-none bg-blue-600 hover:bg-blue-800 transition-all"
								>
									Delete
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	);
};

export default PressetsModal;
