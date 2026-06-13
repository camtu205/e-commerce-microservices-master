package com.rainbowforest.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table (name = "users_details")
public class UserDetails {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "first_name", nullable = false, length = 255)
    private String firstName;
    @Column (name = "last_name", nullable = false, length = 255)
    private String lastName;
    @Column (name = "email", nullable = false, unique = true, length = 255)
    private String email;
    @Column (name = "phone_number", length = 20)
    private String phoneNumber;
    @Column (name = "street", length = 255)
    private String street;
    @Column (name = "street_number", length = 10)
    private String streetNumber;
    @Column (name = "zip_code", length = 6)
    private String zipCode;
    @Column (name = "locality", length = 255)
    private String locality;
    @Column (name = "country", length = 100)
    private String country;

    @Lob
    @Column(name = "avatar", columnDefinition = "LONGTEXT")
    private String avatar;

    @OneToMany(mappedBy = "userDetails", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private java.util.List<Address> addresses = new java.util.ArrayList<>();

    @OneToOne(mappedBy = "userDetails")
	@JsonIgnore 
    private User user;

    @Column(name = "total_spending")
    private Double totalSpending = 0.0;

    @ManyToOne
    @JoinColumn(name = "membership_tier_id")
    private MembershipTier membershipTier;

	public UserDetails() {
	}

	public Double getTotalSpending() {
		return totalSpending;
	}

	public void setTotalSpending(Double totalSpending) {
		this.totalSpending = totalSpending;
	}

	public MembershipTier getMembershipTier() {
		return membershipTier;
	}

	public void setMembershipTier(MembershipTier membershipTier) {
		this.membershipTier = membershipTier;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getStreetNumber() {
		return streetNumber;
	}

	public void setStreetNumber(String streetNumber) {
		this.streetNumber = streetNumber;
	}

	public String getZipCode() {
		return zipCode;
	}

	public void setZipCode(String zipCode) {
		this.zipCode = zipCode;
	}

	public String getLocality() {
		return locality;
	}

	public void setLocality(String locality) {
		this.locality = locality;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public java.util.List<Address> getAddresses() {
		return addresses;
	}

	public void setAddresses(java.util.List<Address> addresses) {
		this.addresses = addresses;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
