// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateVerification {

    // =====================================
    // OWNER
    // =====================================

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner can issue certificates"
        );
        _;
    }


    // =====================================
    // CERTIFICATE STRUCTURE
    // =====================================

    struct Certificate {
        string studentName;
        string rollNumber;
        string course;
        string certificateHash;
        string ipfsHash;
        uint256 issueDate;
        bool exists;
    }


    // =====================================
    // STORAGE
    // =====================================

    mapping(string => Certificate) private certificates;

    // Stores every certificate roll number
    // so the frontend can list certificates.
    string[] private certificateRollNumbers;


    // =====================================
    // EVENTS
    // =====================================

    event CertificateIssued(
        string rollNumber,
        string studentName,
        string course
    );


    // =====================================
    // ISSUE CERTIFICATE
    // =====================================

    function issueCertificate(
        string memory _studentName,
        string memory _rollNumber,
        string memory _course,
        string memory _certificateHash,
        string memory _ipfsHash
    )
        public
        onlyOwner
    {
        require(
            bytes(_studentName).length > 0,
            "Student name is required"
        );

        require(
            bytes(_rollNumber).length > 0,
            "Roll number is required"
        );

        require(
            bytes(_course).length > 0,
            "Course is required"
        );

        require(
            bytes(_certificateHash).length > 0,
            "Certificate hash is required"
        );

        require(
            !certificates[_rollNumber].exists,
            "Certificate already exists"
        );

        certificates[_rollNumber] = Certificate(
            _studentName,
            _rollNumber,
            _course,
            _certificateHash,
            _ipfsHash,
            block.timestamp,
            true
        );

        // Add roll number to the certificate list
        certificateRollNumbers.push(_rollNumber);

        emit CertificateIssued(
            _rollNumber,
            _studentName,
            _course
        );
    }


    // =====================================
    // VERIFY CERTIFICATE
    // =====================================

    function verifyCertificate(
        string memory _rollNumber,
        string memory _certificateHash
    )
        public
        view
        returns(bool)
    {
        if (!certificates[_rollNumber].exists) {
            return false;
        }

        return
            keccak256(
                abi.encodePacked(
                    certificates[_rollNumber].certificateHash
                )
            )
            ==
            keccak256(
                abi.encodePacked(
                    _certificateHash
                )
            );
    }


    // =====================================
    // GET CERTIFICATE
    // =====================================

    function getCertificate(
        string memory _rollNumber
    )
        public
        view
        returns(
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Certificate memory cert =
            certificates[_rollNumber];

        require(
            cert.exists,
            "Certificate not found"
        );

        return(
            cert.studentName,
            cert.rollNumber,
            cert.course,
            cert.certificateHash,
            cert.ipfsHash,
            cert.issueDate
        );
    }


    // =====================================
    // GET CERTIFICATE COUNT
    // =====================================

    function getCertificateCount()
        public
        view
        returns(uint256)
    {
        return certificateRollNumbers.length;
    }


    // =====================================
    // GET CERTIFICATE ROLL NUMBER
    // =====================================

    function getCertificateRollNumber(
        uint256 index
    )
        public
        view
        returns(string memory)
    {
        require(
            index < certificateRollNumbers.length,
            "Invalid certificate index"
        );

        return certificateRollNumbers[index];
    }
}