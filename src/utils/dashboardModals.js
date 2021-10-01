import { Modal } from "antd";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

export function showConfirmModal(title, content) {
	return new Promise((resolve, reject) => {
		const opts = {
			title,
			content,
			icon: <QuestionCircleOutlined />,
			onOk: () => resolve(true),
			onCancel: () => resolve(false),
		};

		Modal.confirm(opts);
	});
}

export function showInfoModal(title, content) {
	return new Promise((resolve, reject) => {
		const opts = {
			title,
			content,
			icon: <InfoCircleOutlined />,
			onOk: () => resolve(true),
			onCancel: () => resolve(false),
		};

		Modal.info(opts);
	});
}

function confirmChangeStatus(selected, status) {
	const verb = { 'rejected': 'reject', 'pending': 'disapprove', 'approved': 'approve' }[status];
	const title = 'Change Status';
	const content = `Are you sure you want to ${verb} ${selected} incident${selected > 1 ? 's' : ''}?`;
	return showConfirmModal(title, content);
}

function locationRequired() {
	return showInfoModal('Location Required', 'Incidents must have city/state to be approved.');
}

export const dashboardModals = { confirmChangeStatus, locationRequired };
