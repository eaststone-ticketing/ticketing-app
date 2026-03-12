import UploadButton from '../../../UploadButton.jsx'

export default function ArendeImageView({activeArende}) {
    return <div>
        <UploadButton arendeID = {activeArende.id} />
        <p>Please do not use this feature yet, it is still being tested</p>
    </div>
}