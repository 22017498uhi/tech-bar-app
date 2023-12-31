import {  useNavigate  } from "react-router-dom";


function ScreenUserSelection() {

    const navigate = useNavigate();

    return (
        <div>
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow mb-3" role="button" onClick={() => {navigate("/usercheckin")}}>
                        <div className="d-flex align-items-center justify-content-center  card-header tb-icon-card-header tb-checkin-icon">
                        <i class="ri-user-follow-line"></i>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title">Check-in</h4>
                            <p className="card-text">Allow users to check-in for service at the location.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                <div className="card shadow mb-3" role="button" onClick={() => {navigate("/queuelist")}}>
                        <div className="d-flex align-items-center justify-content-center  card-header tb-icon-card-header tb-queue-icon">
                        <i class="ri-team-line"></i>
                        
                        </div>
                        <div className="card-body">
                            <h4 className="card-title">Queue List</h4>
                            <p className="card-text">View the current list of users at the location.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 ">
                <div className="card shadow mb-3" role="button" onClick={() => {navigate("/survey")}}>
                        <div className="d-flex align-items-center justify-content-center  card-header tb-icon-card-header tb-survey-icon">
                        <i class="ri-survey-line"></i>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title">Survey</h4>
                            <p className="card-text">Capture feedback of the users at the location.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}


export default ScreenUserSelection;