GET

<https://api.prembly.com/background-check/api/v1/checks/verification?check_id={{check_id}}&country={{country}}>

REQUEST HEADER
Key	Value	Description
x-api-key	API Key	Your live secret API key
PATH PARAMS
Key	Value	Description
check_id		The ID of that particular check gotten from "Get All Available Checks"
country		Country code of the check {e.g NG. KE. GH etc}
RESPONSE
JSON

 "status": true,
    "status_code": "00",
    "detail": [
        {
            "id": "a5ebhuhu-9279-4184-34161-bgodbdbd9b059",
            "check_type": "Identity",
            "name": "Passport Kenya",
            "endpoint": "passport_ke",
            "created_at": "2024-03-07T15:15:48.552Z"
        },
        {
            "id": "fbd67vy6af-8b7c-49e6-b512-14da1b6ryhbff7c",
            "check_type": "Identity",
            "name": "Social Media",
            "endpoint": "social_media",
            "created_at": "2023-11-16T12:46:07.480Z"
        },
        {
            "id": "3byi7r4v6d2-1253-4c3b-aca9-7ed2abcfu6da5",
            "check_type": "Identity",
            "name": "Alien ID",
            "endpoint": "alien_id",
            "created_at": "2023-11-16T12:46:07.480Z"
        },
        {
            "id": "hiu5889e1622-d577-4c7e-8a22-d362798pd26a",
            "check_type": "Identity",
            "name": "National ID",
            "endpoint": "national_id",
            "created_at": "2023-11-16T12:46:07.480Z"
        }
    ]
}