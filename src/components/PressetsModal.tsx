import Button from './Button';
import Input from './Input';
export const PressetsModal = ({ isOpen, onClose }) => {
	return (
		isOpen && (
			<div className="fixed inset-0 z-20 flex items-center justify-center ">
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
					onClick={onClose}
				/>
				<div className="relative bg-white w-[600px] max-h-[80vh] rounded-xl shadow-xl">
					<div className="text-center pt-6">
						<h2 className="text-2xl font-bold">Presets configuration</h2>
					</div>
					<div className="px-6 py-4 overflow-y-auto">
						<form className="space-y-4 " action="">
							<Input id="title" placeholder="" label={'Preset Name'} />

							{/* <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 mb-1">
									Parse pattern
								</label> */}
							{/* <select
									name=""
									className="bg-gray-50 w-full rounded-lg border px-4 py-2 "
									id="pattern"
								>
									<option value="Ignore pattern">Ignore pattern</option>
								</select> */}
							<Input id="include" placeholder="" label={'Files to include'} />
							<Input id="exclude" placeholder="" label={'Files to exclude'} />

							<textarea
								name=""
								className="bg-gray-50 w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
								id="content"
								rows={5}
								cols={5}
								placeholder="Content"
							></textarea>
							<div className="flex justify-between ">
								<Button
									onClick={() => console.log('save')}
									className="border px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-700"
								>
									Save
								</Button>
								<Button
									onClick={() => console.log('Delete')}
									className="border px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-700"
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
